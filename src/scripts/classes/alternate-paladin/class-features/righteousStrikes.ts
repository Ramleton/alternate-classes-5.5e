import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getDivineSmiteDamageType } from '../subclasses/utils/utils.js';

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor)
    return;
  const { utils: { constants, workflowUtils } } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some(type => type === actionType))
    return;
  const damageType = getDivineSmiteDamageType(feat.actor);
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
        macro: workflow,
        priority: 100,
      },
    ],
  },
};

export default macro;
