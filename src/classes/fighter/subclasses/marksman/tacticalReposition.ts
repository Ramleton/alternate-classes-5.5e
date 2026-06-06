import { activityUtils, workflowUtils } from 'chrisPremades';

async function useTacticalReposition(
  { trigger: { entity: item, token }, workflow },
) {
  if (workflow
    ?.item
    .flags
    ['chris-premades']
    ?.info
    ?.identifier !== 'ac55eSecondWind'
  ) return;
  const activity = activityUtils.getActivityByIdentifier(item, 'use', {
    strict: true,
  });
  await workflowUtils.syntheticActivityRoll(activity, [token]);
}

export const ac55eTacticalReposition = {
  name: 'Tactical Reposition',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: useTacticalReposition,
        priority: 50,
      },
    ],
  },
};
