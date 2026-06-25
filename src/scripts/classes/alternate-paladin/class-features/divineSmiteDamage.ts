import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageType } from '../../../../types/damage.js';

interface DamageObject {
  formula: string;
  damageType: DamageType;
}

const pre = async (
  actor: Actor5e,
  workflow: Workflow,
): Promise<DamageObject | undefined> => {
  if (!workflow.hitTargets.size)
    return;
  const { utils: { workflowUtils } } = chrisPremades;
  if (workflowUtils.getActionType(workflow) === 'heal')
    return;
  const flag = actor
    .flags['alternate-classes-55e']
    ?.macros
    ?.divineSmite
    ?.damage;
  return flag;
};

const during = async (
  workflow: Workflow,
  damage: DamageObject,
): Promise<void> => {
  const { utils: { workflowUtils } } = chrisPremades;
  const options = { damageType: damage.damageType };
  await workflowUtils.bonusDamage(workflow, damage.formula, options);
};

const damageWorkflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor)
    return;
  const res1 = await pre(feat.actor, workflow);
  if (!res1)
    return;
  await during(workflow, res1);
};

export default damageWorkflow;
