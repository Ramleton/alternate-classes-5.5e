import {
  genericUtils,
  workflowUtils,
} from 'chrisPremades';

import { Workflow } from '@midi-qol/types/module/Workflow';

interface DamageFlag {
  formula: string;
  type: string;
}

async function pre(
  actor,
  workflow: Workflow,
): Promise<DamageFlag | undefined> {
  if (!workflow.hitTargets.size) return;
  const flag = actor
    .flags['alternate-classes-55e']
    ?.macros
    ?.['enchantedShot']
    ?.damage;
  return flag;
}

async function during(
  workflow: Workflow,
  damageFlag: DamageFlag,
): Promise<void> {
  if (damageFlag.type)
    return await workflowUtils.bonusDamage(
      workflow,
      damageFlag.formula,
      { damageType: damageFlag.type },
    );
  await workflowUtils.bonusDamage(workflow, damageFlag.formula);
}

async function post(actor: Actor): Promise<void> {
  await genericUtils.unsetFlag(
    actor,
    'alternate-classes-55e',
    'macros.enchantedShot.damage',
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

export const ac55eEnchantedShotDamage = {
  name: 'Enchanted Shots: Damage',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: workflow,
        priority: 200,
      },
    ],
  },
};
