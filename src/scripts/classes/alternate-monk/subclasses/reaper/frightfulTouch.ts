import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isMeleeMartialArtsAttack } from 'martialArts/utils.js';
import { getKiRemaining, spendKi } from '../../mystic-techniques/utils.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!isMeleeMartialArtsAttack({ workflow })) return;
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses!.value) return;
  if (!getKiRemaining(workflow.actor)) return;
  const {
    utils: {
      activityUtils,
      genericUtils,
      workflowUtils,
      dialogUtils,
      socketUtils,
    },
  } = chrisPremades;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  const saveActivity = activityUtils.getActivityByIdentifier(feat, 'save', {
    strict: true,
  });
  if (!saveActivity) return false;
  await workflowUtils.syntheticActivityRoll(
    saveActivity,
    [workflow.hitTargets.first() as Token],
    {
      consumeUsage: true,
    },
  );
  await spendKi(workflow.actor, 1);
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses!.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eFrightfulTouch',
  name: 'Reaper: Frightful Touch',
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
