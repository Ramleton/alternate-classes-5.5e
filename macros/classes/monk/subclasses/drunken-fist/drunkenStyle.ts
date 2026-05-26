import {
  activityUtils,
  actorUtils,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function drunkenStyle({ trigger: { entity: item }, workflow, ditem }) {
  if (!workflowUtils.isAttackType(workflow, 'attack')) return;
  /**
   * Make sure the attack is a Martial Arts attack
   */
  if (
    workflow.item.flags['chris-premades']?.info?.identifier !==
      'unarmedStrike' &&
    workflow.item.system.type.value !== 'simpleM' &&
    !(
      workflow.item.system.type.value === 'martialM' &&
      workflow.item.system.properties.some((p) => p !== 'hvy' && p !== 'spc')
    )
  )
    return;
  if (!workflow.hitTargets.size) return;
  const useActivity = activityUtils.getActivityByIdentifier(item, 'use', {
    strict: true,
  });
  if (!useActivity) return;
  await workflowUtils.syntheticActivityRoll(useActivity);
}

export const ac55eDrunkenStyle = {
  name: 'Drunken Style',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: drunkenStyle,
        priority: 100,
      },
    ],
  },
};
