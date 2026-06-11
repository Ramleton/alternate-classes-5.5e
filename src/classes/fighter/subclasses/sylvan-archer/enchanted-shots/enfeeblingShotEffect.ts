import {
  constants,
  workflowUtils,
} from 'chrisPremades';

import { Workflow } from '@midi-qol/types/module/Workflow';

async function pre(workflow: Workflow): Promise<boolean> {
  if (!workflow.hitTargets.size) return false;
  if (!constants.weaponAttacks.includes(workflow.activity.getActionType()))
    return false;
  return true;
}

async function post(workflow: Workflow): Promise<void> {
  const damageRoll = workflow.damageRoll;
  const replaceRoll = `${damageRoll!.formula} * 0.5`;
  await workflowUtils.replaceDamage(workflow, replaceRoll);
}

async function workflow({ workflow }) {
  const res1 = await pre(workflow);
  if (!res1) return;
  post(workflow);
}

export const ac55eEnfeeblingShotDamage = {
  name: 'Enfeebling Shot: Damage',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: workflow,
        priority: 991,
      },
    ],
  },
};
