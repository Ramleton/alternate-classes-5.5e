import {
  genericUtils,
  workflowUtils,
} from 'chrisPremades';

import { Workflow } from '@midi-qol/types/module/Workflow';

async function pre(
  actor,
  workflow: Workflow,
): Promise<string> {
  if (!workflow.hitTargets.size) return '';
  const flag = actor
    .flags['alternate-classes-55e']
    ?.macros
    ?.runeCarver
    ?.fire;
  return flag;
}

async function during(
  workflow: Workflow,
  damageFormula: string,
): Promise<void> {
  await workflowUtils.bonusDamage(
    workflow,
    damageFormula,
    { damageType: 'fire' },
  );
}

async function post(actor: Actor5e): Promise<void> {
  await genericUtils.unsetFlag(
    actor,
    'alternate-classes-55e',
    'macros.runeCarver.fire',
  );
}

async function workflow({
  trigger: { entity: item },
  workflow,
}) {
  const dmgFormula = await pre(item.actor, workflow);
  if (!dmgFormula) return;
  await during(workflow, dmgFormula);
  await post(item.actor);
}

export const ac55eFireRuneDamage = {
  name: 'Fire Rune: Damage',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: workflow,
        priority: 100,
      },
    ],
  },
};
