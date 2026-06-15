import CPRMacro from 'chris-premades/macro.js';

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
  const { utils: { activityUtils, workflowUtils } } = chrisPremades;
  const activity = activityUtils.getActivityByIdentifier(item, 'use', {
    strict: true,
  });
  await workflowUtils.syntheticActivityRoll(activity, [token]);
}

const macro: CPRMacro = {
  identifier: 'ac55eTacticalReposition',
  name: 'Tactical Reposition',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
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

export default macro;
