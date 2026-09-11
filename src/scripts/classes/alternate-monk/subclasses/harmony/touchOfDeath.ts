import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getKiRemaining } from '../../mystic-techniques/utils.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  const {
    utils: {
      activityUtils,
      dialogUtils,
      genericUtils,
      socketUtils,
      effectUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (workflowUtils.getActionType(workflow) !== 'mwak') return;
  if (
    workflow.item.flags['chris-premades']?.info?.identifier !== 'unarmedStrike'
  )
    return;
  if (!workflow.hitTargets.size) return;
  const feat = item as Item<'feat'>;
  const opponent = workflow.hitTargets.first() as Token;
  if (!getKiRemaining(feat.actor!)) return;
  if (!feat.system.uses!.value) return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  const dmgActivity = activityUtils.getActivityByIdentifier(feat, 'damage', {
    strict: true,
  });
  const activityData = genericUtils.duplicate(dmgActivity.toObject());
  // Override damage type to radiant if target is undead
  if (opponent.actor!.system.details.type.value === 'undead')
    activityData.damage.parts[0].types = ['radiant'];
  await workflowUtils.syntheticActivityDataRoll(
    activityData,
    feat,
    feat.actor!,
    [opponent],
    { consumeResources: true, consumeUsage: true },
  );
  const monkLevel = feat.actor!.classes['alternate-monk'].system.levels;
  if (monkLevel < 6) return;
  const poisonSelection = await dialogUtils.confirm(
    'Touch of Death',
    'Poison creature?',
  );
  if (!poisonSelection) return;
  const effectData = {
    name: `${item.name}: Poisoned`,
    img: workflow.item.img,
    origin: workflow.item.uuid,
    duration: {
      rounds: 2,
    },
    statuses: ['poisoned'],
    flags: {
      dae: {
        specialDuration: ['turnEndSource'],
      },
    },
  };
  await effectUtils.createEffect(opponent.actor!, effectData, {
    identifier: 'touchOfDeathPoisoned',
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eTouchOfDeath',
  name: 'Way of Harmony: Touch Of Death',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 100,
      },
    ],
  },
};

export default macro;
