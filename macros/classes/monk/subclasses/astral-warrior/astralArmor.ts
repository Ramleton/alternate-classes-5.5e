import {
  activityUtils,
  constants,
  actorUtils,
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  tokenUtils,
  workflowUtils,
} from 'chris-premades/scripts/utils.js';

async function manifestSave({ trigger: { entity: item }, workflow, ditem }) {
  const nearbyTargets = tokenUtils.findNearby(workflow.token, 10, 'all', {
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
  await workflowUtils.syntheticActivityRoll(enchantActivity);
  if (!nearbyTargets.length) return;
  await workflowUtils.syntheticActivityRoll(saveActivity, nearbyTargets);
}

export const ac55eAstralArmor = {
  name: 'Astral Armor',
  version: '1.3.141',
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
