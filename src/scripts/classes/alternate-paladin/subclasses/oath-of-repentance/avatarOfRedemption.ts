import CPRMacro, { MacroFunction, MidiMacroFunction } from 'chris-premades/macro.js';

const setFlag: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  const { utils: { effectUtils, genericUtils, workflowUtils } } = chrisPremades;
  if (
    workflowUtils.getActionType(workflow) !== 'save'
    && !ditem?.totalDamage
  )
    return;
  if (workflow.item.identifier === 'aura-of-penance')
    return;
  const effect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eAvatarOfRedemptionEffect',
  );
  if (!effect)
    return;
  await genericUtils.setFlag(feat.actor!,
    'alternate-classes-55e',
    'macros.avatar-of-redemption',
    true,
  );
};

const unsetFlag: MacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.unsetFlag(feat.actor!,
    'alternate-classes-55e',
    'macros.avatar-of-redemption',
  );
};

const avatarOfRedemption: CPRMacro = {
  identifier: 'ac55eAvatarOfRedemption',
  name: 'Oath of Repentance: Avatar of Redemption',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'applyDamage',
        macro: setFlag,
        priority: 50,
      },
      {
        pass: 'rollFinished',
        macro: setFlag,
        priority: 50,
      },
    ],
  },
  combat: [{
    pass: 'turnStart',
    macro: unsetFlag,
    priority: 50,
  }],
};

export default avatarOfRedemption;
