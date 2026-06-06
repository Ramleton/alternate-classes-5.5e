import { Workflow } from '@midi-qol/types/module/Workflow';
import {
  activityUtils,
  dialogUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from 'chrisPremades';

async function pre(
  item,
  workflow: Workflow,
  unyieldingKnight,
): Promise<boolean> {
  if (!workflow.hitTargets.size) return false;
  if (!unyieldingKnight) {
    const selection = await dialogUtils.confirmUseItem(item, {
      userId: socketUtils.firstOwner(item.actor, true),
    });
    return selection;
  }
  return true;
}

async function during(
  item,
  workflow: Workflow,
): Promise<boolean> {
  const useActivity = activityUtils.getActivityByIdentifier(item, 'use', {
    strict: true,
  });
  if (!useActivity) return false;
  await workflowUtils.syntheticActivityRoll(
    useActivity,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [workflow.hitTargets.first() as any],
    {
      consumeResources: true,
    },
  );
  return true;
}

async function post(
  item,
): Promise<void> {
  await item.update({ 'system.uses.spent': item.system.uses.spent + 1 });
}

async function workflow({
  trigger: { entity: item },
  workflow,
}) {
  const unyieldingKnight = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eUnyieldingKnight',
  );
  if (!item.system.uses.value && !unyieldingKnight) return;
  const res1 = await pre(item, workflow, unyieldingKnight);
  if (!res1) return;
  const res2 = await during(item, workflow);
  if (!res2) return;
  if (!unyieldingKnight)
    await post(item);
}

export const ac55eExploitChivalricMarkApply = {
  name: 'Chivalric Mark: Apply',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: workflow,
        priority: 100,
      },
    ],
  },
};
