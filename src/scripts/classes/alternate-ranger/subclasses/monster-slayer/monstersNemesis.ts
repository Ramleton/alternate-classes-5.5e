import { getValidWeapons } from 'automation/weaponUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectChange, EffectData } from 'types/effects.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const downgradeTraitsOfQuarry: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const {
    utils: { constants, effectUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  const target = workflow.hitTargets.first() as Token;
  const targetActor = target.actor;
  if (!targetActor) return;
  const feat = entity as Item<'feat'>;
  if (!isQuarry(feat.actor!, targetActor)) return;
  const downgrades = Array.from(targetActor.system.traits.di.value);
  const changes = downgrades
    .map((i) => ({
      key: 'system.traits.di.value',
      mode: 2,
      value: '-' + i,
      priority: 20,
    }))
    .concat(
      downgrades.map((i) => ({
        key: 'system.traits.dr.value',
        mode: 2,
        value: i,
        priority: 20,
      })),
    ) as EffectChange[];
  const effectData: EffectData = {
    name: feat.name,
    icon: feat.img!,
    origin: feat.uuid!,
    duration: {
      seconds: 1,
    },
    changes,
    flags: {
      dae: {
        stackable: 'noneName',
        specialDuration: ['isDamaged'],
      },
      'chris-premades': {
        effect: {
          noAnimation: true,
        },
      },
    },
    statuses: [],
  };
  await effectUtils.createEffect(targetActor, effectData);
};

const reactionAttack: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (workflow.hitTargets.size && !workflow.saves.has(token)) return;
  const {
    utils: { actorUtils, dialogUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  if (!isQuarry(feat.actor!, workflow.actor)) return;
  const validWeapons = getValidWeapons(token, workflow.token!, true);
  if (!validWeapons.length) return;
  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    'Use your reaction to attack your Quarry with a weapon?',
    { userId },
  );
  if (!selection) return;
  let selectedWeapon: Item<'weapon'> | undefined;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon = (await dialogUtils.selectDocumentDialog(
      `${feat.name}: Select Weapon`,
      'Select a weapon to use',
      validWeapons,
      { userId },
    )) as Item<'weapon'> | undefined;
    if (!selectedWeapon) return;
  }
  await workflowUtils.syntheticItemRoll(selectedWeapon, [workflow.token!], {
    consumeResources: true,
    userId,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eMonstersNemesis',
  name: "Monster Slayer: Monster's Nemesis",
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: downgradeTraitsOfQuarry,
        priority: 100,
      },
      {
        pass: 'targetSavesComplete',
        macro: reactionAttack,
        priority: 100,
      },
      {
        pass: 'targetAttackRollComplete',
        macro: reactionAttack,
        priority: 100,
      },
    ],
  },
};

export default macro;
