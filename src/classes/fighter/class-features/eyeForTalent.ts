import type { Workflow } from '@midi-qol/types/module/Workflow';
import { activityUtils, workflowUtils } from 'chrisPremades';

async function preEyeForTalent({ workflow }: { workflow: Workflow }) {
  if (!workflow.hitTargets.size) return false;
}

async function eyeForTalent({
  trigger: { entity: item },
  workflow,
}) {
  const checkActivity = activityUtils.getActivityByIdentifier(item, 'check', {
    strict: true,
  });
  if (!checkActivity) return false;
  const workflowResult = await workflowUtils.syntheticActivityRoll(
    checkActivity,
    [workflow.token],
  );
  console.log(`Eye for Talent: `, workflowResult);
  return true;
}

async function eyeForTalentWorkflow({
  trigger: { entity: item },
  workflow,
}) {
  const res1 = await preEyeForTalent({ workflow });
  if (!res1) return;
  await eyeForTalent({
    trigger: { entity: item },
    workflow,
  });
}

export const ac55eEyeForTalent = {
  name: 'Eye for Talent',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: eyeForTalentWorkflow,
        priority: 100,
      },
    ],
  },
};
