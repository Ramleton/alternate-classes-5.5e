import { activityUtils, workflowUtils } from 'chrisPremades';

async function useMasterfulFocus(
  { trigger: { entity: item, token }, workflow },
) {
  const itemIdentifier: string = workflow
    ?.item
    .flags
    ['chris-premades']
    ?.info
    ?.identifier || '';
  if (!['ac55eSecondWind', 'ac55eActionSurge'].includes(itemIdentifier))
    return;
  const activity = activityUtils.getActivityByIdentifier(item, 'use', {
    strict: true,
  });
  await workflowUtils.syntheticActivityRoll(
    activity,
    [token],
    { consumeResources: true },
  );
}

export const ac55eMasterfulFocus = {
  name: 'Masterful Focus',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: useMasterfulFocus,
        priority: 50,
      },
    ],
  },
};
