import { getValidWeapons } from 'automation/weaponUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const attackPrompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const {
    utils: {
      actorUtils,
      dialogUtils,
      constants,
      genericUtils,
      tokenUtils,
      workflowUtils,
      socketUtils,
    },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor)) return;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.attacks.some((type) => type === actionType)) return;
  if (!tokenUtils.canSee(token, workflow.token!)) return;
  if (!isQuarry(feat.actor, workflow.token!.actor!)) return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  await genericUtils.setFlag(
    feat.actor,
    'alternate-classes-55e',
    'macros.deadlyCounter',
    true,
  );
  await actorUtils.setReactionUsed(feat.actor);
  workflow.tracker.disadvantage.add(feat.name, feat.name);
};

const attackMiss: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const {
    utils: { effectUtils, genericUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  if (!feat.actor.flags['alternate-classes-55e']?.macros?.deadlyCounter) return;
  await genericUtils.unsetFlag(
    feat.actor,
    'alternate-classes-55e',
    'macros.deadlyCounter',
  );
  if (workflow.hitTargets.size) return;
  const validWeapons = getValidWeapons(token, workflow.token!, true);
  if (!validWeapons.length) return;
  let selectedWeapon: Item<'weapon'> | undefined;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon =
      (await chrisPremades.utils.dialogUtils.selectDocumentDialog(
        `${feat.name}: Select Weapon`,
        'Select a weapon to use',
        validWeapons,
      )) as Item<'weapon'> | undefined;
    if (!selectedWeapon) return;
  }
  if (tokenUtils.getLightLevel(token) !== 'bright') {
    const effectData: EffectData = {
      name: 'Deadly Counter: Advantage',
      icon: feat.img!,
      duration: { seconds: 1 },
      origin: feat.uuid!,
      flags: {
        dae: {
          stackable: 'noneName',
          specialDuration: ['1Attack'],
        },
      },
      changes: [
        {
          key: 'flags.midi-qol.advantage.attack.all',
          mode: 0,
          value: 1 + '',
          priority: 100,
        },
      ],
      statuses: [],
    };
    const effect = await effectUtils.createEffect(feat.actor, effectData);
    await workflowUtils.addEntityRemoval(workflow, [effect]);
  }
  await workflowUtils.syntheticItemRoll(selectedWeapon, [workflow.token!]);
};

const macro: CPRMacro = {
  identifier: 'ac55eDeadlyCounter',
  name: 'Deep Stalker: Deadly Counter',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetPreAttackRollConfig',
        macro: attackPrompt,
        priority: 100,
      },
      {
        pass: 'targetAttackRollComplete',
        macro: attackMiss,
        priority: 100,
      },
    ],
  },
};

export default macro;
