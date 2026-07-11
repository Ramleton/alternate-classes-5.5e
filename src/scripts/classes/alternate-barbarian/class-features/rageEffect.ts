import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';

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
  const lastRound = effect.flags['alternate-classes-55e']?.lastRound;
  const {
    utils: { genericUtils },
  } = chrisPremades;
  if (!lastRound) {
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
        pass: 'targetApplyDamage',
        macro: extendRageDamaged,
        priority: 0,
      },
    ],
  },
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
