import {
  activityUtils,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function masterfulAim({
  trigger: { entity: item },
  workflow,
}) {
  if (workflow.d20AttackRoll < 8) return;
  const signatureWeapon = itemUtils
    .getEffectByIdentifier(
      workflow.item,
      'ac55eSignatureWeapon',
    );
  if (!signatureWeapon) return;
  const roll = await rollUtils.replaceD20(workflow.attackRoll, 8);
  await workflow.setAttackRoll(roll);
}

export const ac55eMasterfulAim = {
  name: 'Masterful Aim',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: masterfulAim,
        priority: 100,
      },
    ],
  },
};
