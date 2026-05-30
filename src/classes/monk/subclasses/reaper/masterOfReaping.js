import {
  activityUtils,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function masterOfReaping({
  trigger: { entity: item },
  workflow,
}) {
  const mysticTechniques = itemUtils.getItemByIdentifier(
    item.actor,
    'mysticTechniques',
  );
  if (!mysticTechniques?.system?.uses?.value) return;
  const saveActivity = activityUtils.getActivityByIdentifier(item, 'save', {
    strict: true,
  });
  if (!saveActivity) return;
  await workflowUtils.syntheticActivityRoll(
    saveActivity,
    [workflow.targets.first()],
  );
  return true;
}

export const ac55eMasterOfReaping = {
  name: 'Master of Reaping',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: masterOfReaping,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};
