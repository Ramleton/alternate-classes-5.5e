import { Workflow } from '@midi-qol/types/module/Workflow';
import CPRMacro from 'chris-premades/macro.js';

async function pre(workflow: Workflow): Promise<boolean> {
  const {
    utils: { constants },
  } = chrisPremades;
  if (!workflow.hitTargets.size) return false;
  if (!constants.weaponAttacks.includes(workflow.activity.getActionType()))
    return false;
  return true;
}

async function post(workflow: Workflow): Promise<void> {
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const damageRoll = workflow.damageRoll;
  const replaceRoll = `floor((${damageRoll!.formula}) * 0.5)`;
  await workflowUtils.replaceDamage(workflow, replaceRoll);
}

const workflow = async ({ workflow }) => {
  const res1 = await pre(workflow);
  if (!res1) return;
  await post(workflow);
};

const macro: CPRMacro = {
  identifier: 'ac55eEnfeeblingShotEffect',
  name: 'Enfeebling Shot: Effect',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
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

export default macro;
