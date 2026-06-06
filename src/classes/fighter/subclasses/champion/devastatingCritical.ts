import {
  dialogUtils,
  socketUtils,
} from 'chrisPremades';

import { Workflow } from '@midi-qol/types/module/Workflow';

async function pre(
  item,
  workflow: Workflow,
): Promise<boolean> {
  if (!workflow.hitTargets.size) return false;
  if (!workflow.isCritical) return false;
  if (!item.system.uses.value) return false;
  const selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  return selection;
}

async function during(workflow: Workflow): Promise<void> {
  const newDamageRolls = workflow.damageRolls.map(async roll =>
    await Roll.create(roll.formula).evaluate({ maximize: true }),
  );
  await workflow.setDamageRolls(await Promise.all(newDamageRolls));
}

async function post(item): Promise<void> {
  item.update({ 'system.uses.spent': item.system.uses.spent + 1 });
}

async function workflow({
  trigger: { entity: item },
  workflow,
}) {
  const res1 = await pre(item, workflow);
  if (!res1) return;
  await during(workflow);
  await post(item);
}

export const ac55eDevastatingCritical = {
  name: 'Devastating Critical',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: workflow,
        priority: 999,
      },
    ],
  },
};
