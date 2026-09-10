import CPRMacro from 'chris-premades/macro.js';

async function manifestSave({ trigger: { entity: item }, workflow }) {
  const {
    utils: { activityUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const nearbyTargets = tokenUtils.findNearby(workflow.token, 10, 'any', {
    includeIncapacitated: true,
    includeToken: false,
  });
  const saveActivity = activityUtils.getActivityByIdentifier(item, 'save', {
    strict: true,
  });
  if (!saveActivity) return;
  const enchantActivity = activityUtils.getActivityByIdentifier(
    item,
    'enchant',
    {
      strict: true,
    },
  );
  if (!enchantActivity) return;
  await workflowUtils.syntheticActivityRoll(enchantActivity, []);
  if (!nearbyTargets.length) return;
  await workflowUtils.syntheticActivityRoll(saveActivity, nearbyTargets);
}

export const macro: CPRMacro = {
  name: 'Way of the Astral Warrior: Astral Armor',
  version: '1.0.0',
  identifier: 'ac55eAstralArmor',
  source: 'Alternate Classes 5.5e',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: manifestSave,
        priority: 50,
        activities: ['manifest'],
      },
    ],
  },
};

export default macro;
