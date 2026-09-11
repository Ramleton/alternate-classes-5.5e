import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ workflow }) => {
  if (workflow.d20AttackRoll < 8) return;
  const {
    utils: { itemUtils, rollUtils },
  } = chrisPremades;
  const signatureWeapon = itemUtils.getEffectByIdentifier(
    workflow.item,
    'ac55eSignatureWeapon',
  );
  if (!signatureWeapon) return;
  const roll = await rollUtils.replaceD20(workflow.attackRoll, 8);
  await workflow.setAttackRoll(roll);
};

const macro: CPRMacro = {
  identifier: 'ac55eMasterfulAim',
  name: 'Shining Steel: Masterful Aim',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: handle,
        priority: 100,
      },
    ],
  },
};

export default macro;
