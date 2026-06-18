import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageType } from 'types/damage.js';

const damageWorkflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor)
    return;
  const { utils: { itemUtils, workflowUtils } } = chrisPremades;
  let damageType: DamageType = 'radiant';
  if (itemUtils.getItemByIdentifier(feat.actor, 'ac55eDivineSmiteThunder')) {
    damageType = 'thunder';
  }
  if (itemUtils.getItemByIdentifier(feat.actor, 'ac55eDivineSmiteNecrotic')) {
    damageType = 'necrotic';
  }
  await workflowUtils.bonusDamage(workflow, '1d8', { damageType });
};

const macro: CPRMacro = {
  identifier: `ac55eRighteousStrikes`,
  name: `Righteous Strikes`,
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: damageWorkflow,
        priority: 100,
      },
    ],
  },
};

export default macro;
