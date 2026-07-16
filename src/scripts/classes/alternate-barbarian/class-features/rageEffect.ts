import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

export const extendRage = async (effect: ActiveEffect) => {
  const combat = game.combat;
  if (!combat || !combat.round) return;
  const nextRound = combat.round + 1;
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.setFlag(
    effect,
    'alternate-classes-55e',
    'lastRound',
    nextRound,
  );
};

const extendRageAttack: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!workflow.targets.size) return;
  const target = workflow.targets.first() as Token;
  if (target.document.disposition !== CONST.TOKEN_DISPOSITIONS.HOSTILE) return;
  const effect = entity as unknown as ActiveEffect;
  await extendRage(effect);
};

const extendRageDamaged: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (actionType === 'healing') return;
  const effect = entity as unknown as ActiveEffect;
  await extendRage(effect);
};

const extendRageStrCheck: MacroFunction = async ({
  trigger: { entity, roll },
}) => {
  if (roll.data.abilityId !== 'str') return;
  const effect = entity as unknown as ActiveEffect;
  await extendRage(effect);
};

const endRage: MacroFunction = async ({
  trigger: { entity, currentRound },
}) => {
  const effect = entity as unknown as ActiveEffect;
  const {
    utils: { genericUtils, itemUtils },
  } = chrisPremades;
  const feralInstinct = itemUtils.getItemByIdentifier(
    effect.parent! as Actor5e,
    'ac55eFeralInstinct',
  );
  if (feralInstinct) return;

  let lastRound = effect.flags['alternate-classes-55e']?.lastRound;
  if (!lastRound) {
    lastRound = currentRound! + 1;
    await genericUtils.setFlag(
      effect,
      'alternate-classes-55e',
      'lastRound',
      currentRound! + 1,
    );
  }

  if (lastRound === currentRound! + 1) return;
  await effect.delete();
};

const resetOnCombatStart: MacroFunction = async ({ trigger: { entity } }) => {
  const effect = entity as unknown as ActiveEffect;
  const {
    utils: { genericUtils },
  } = chrisPremades;
  const combat = game.combat!;
  console.log(combat.combatants, effect.parent!.id);
  if (!combat.combatants.find((c) => c.actorId === effect.parent!.id)) return;
  await genericUtils.setFlag(effect, 'alternate-classes-55e', 'lastRound', 1);
};

const unstoppable: MidiMacroFunction = async ({
  trigger: { entity },
  ditem,
}) => {
  if (!ditem || ditem.newHP) return;
  const effect = entity as unknown as ActiveEffect;
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const unstoppable = itemUtils.getItemByIdentifier(
    effect.parent! as Actor5e,
    'ac55eUnstoppable',
  );
  if (!unstoppable) return;
  ditem.totalDamage = ditem.oldHP - 1;
  ditem.newHP = 1;
  ditem.newTempHP = 0;
  ditem.hpDamage = ditem.totalDamage;
  ditem.damageDetail.forEach((i) => (i.value = 0));
  ditem.damageDetail[0].value = ditem.totalDamage;
  await effect.delete();
};

const unstoppableSaveBonus: MacroFunction = async ({
  trigger: { entity, roll, saveId },
}) => {
  if (!['int', 'wis', 'cha'].some((ability) => ability === saveId)) return;
  const conMod = (entity.parent! as Actor5e).system.abilities.con.mod;
  const {
    utils: { rollUtils },
  } = chrisPremades;
  return await rollUtils.addToRoll(roll, `${Math.max(1, conMod)}`);
};

const updateDamageType: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const effect = entity as unknown as ActiveEffect;
  const {
    utils: { genericUtils, itemUtils },
  } = chrisPremades;
  const actor = effect.parent as Actor5e;
  const spectralWarriors = itemUtils.getItemByIdentifier(
    actor,
    'ac55eSpectralWarriors',
  );
  const exploitDie = getAlternateMartialExploitDie(actor);
  if (!exploitDie) return;
  if (!spectralWarriors) return;
  const spectralWarriorsSpace =
    spectralWarriors.flags['alternate-classes-55e'].spectralWarriorsSpace;
  if (spectralWarriorsSpace !== actor.uuid) return;
  const newChanges = effect.changes.map((c) => {
    if (c.key === 'flags.automated-conditions-5e.damage.bonus') {
      c.value = `bonus=1${exploitDie}[radiant]; ability.str && (mwak || rwak);`;
    }
  });
  await genericUtils.update(effect, { changes: newChanges });
};

const rageEffectMacro: CPRMacro = {
  identifier: 'ac55eRageEffect',
  name: 'Rage: Effect',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: extendRageAttack,
        priority: 0,
      },
      {
        pass: 'attackRollComplete',
        macro: updateDamageType,
        priority: 0,
      },
      {
        pass: 'targetApplyDamage',
        macro: extendRageDamaged,
        priority: 0,
      },
      {
        pass: 'targetApplyDamage',
        macro: unstoppable,
        priority: 990,
      },
    ],
  },
  save: [
    {
      pass: 'bonus',
      macro: unstoppableSaveBonus,
      priority: 0,
    },
  ],
  skill: [
    {
      pass: 'post',
      macro: extendRageStrCheck,
      priority: 0,
    },
  ],
  check: [
    {
      pass: 'post',
      macro: extendRageStrCheck,
      priority: 0,
    },
  ],
  combat: [
    {
      pass: 'combatStart',
      macro: resetOnCombatStart,
      priority: 0,
    },
    {
      pass: 'turnEnd',
      macro: endRage,
      priority: 0,
    },
  ],
};

export default rageEffectMacro;
