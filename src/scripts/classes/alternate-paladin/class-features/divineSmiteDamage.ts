import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageType } from '../../../../types/damage.js';

const pre = async (actor: Actor5e, workflow: Workflow) => {
  if (!workflow.hitTargets.size)
    return;
  const flag = actor
    .flags['alternate-classes-55e']
    ?.macros
    ?.divineSmite
    ?.damage;
  return flag;
};

interface DamageObject {
  formula: string;
  type: DamageType;
}

const during = async (damage: DamageObject) => {
  const { utils: { workflowUtils } } = chrisPremades;
  const options = { damageType: damage.type };
  await workflowUtils.bonusDamage(damageWorkflow, damage.formula, options);
};

const post = async (actor: Actor5e): Promise<void> => {
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.unsetFlag(
    actor,
    'alternate-classes-55e',
    'macros.divineSmite.damage',
  );
};

const damageWorkflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat.actor, workflow);
  if (!res1) return;
  await during(res1);
  await post(feat.actor);
};

export default damageWorkflow;
