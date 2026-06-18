import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getDivineSmiteDamageType } from '../utils/utils.js';

const applyDamage = async (feat: Item<'feat'>, workflow: Workflow) => {
  if (!feat.actor)
    return;
  if (!workflow.token)
    return;
  if (workflow.actor!.id === feat.actor.id)
    return;
  const chaMod = feat.actor.system.abilities.cha.mod;
  const damage = Math.max(chaMod, 1);
  const damageType = getDivineSmiteDamageType(feat.actor);
  const { utils: { workflowUtils } } = chrisPremades;
  await workflowUtils.applyDamage([workflow.token], damage, damageType);
};

const onSave: MidiMacroFunction = async (data) => {
  const { trigger: { entity }, workflow } = data;
  const { utils: { workflowUtils } } = chrisPremades;
  const feat = entity as Item<'feat'>;
  if (workflowUtils.getActionType(workflow) !== 'save')
    return;
  await applyDamage(feat, workflow);
  workflow.reprisalApplied = true;
};

const onDamage: MidiMacroFunction = async (data) => {
  const { trigger: { entity }, workflow } = data;
  if (workflow.reprisalApplied)
    return;
  const feat = entity as Item<'feat'>;
  await applyDamage(feat, workflow);
};

const macro: CPRMacro = {
  identifier: 'ac55eRuthlessReprisal',
  name: 'Oath of Conquest: Ruthless Reprisal',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetPreambleComplete',
        macro: onSave,
        priority: 50,
      },
      {
        pass: 'targetApplyDamage',
        macro: onDamage,
        priority: 50,
      },
    ],
  },
};

export default macro;
