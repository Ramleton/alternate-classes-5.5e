import {
  activityUtils,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function preMasterOfShiningSteel({
  trigger: { entity: item },
  workflow,
}) {
  const signatureWeapon = itemUtils
    .getEffectByIdentifier(
      workflow.item,
      'ac55eSignatureWeapon',
    );
  if (!signatureWeapon) return false;
  if (!item.system.uses.value) return false;
  const selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  return selection;
}

async function masterOfShiningSteel({
  trigger: { entity: item },
  workflow,
  monkLevel,
}) {
  const roll = await rollUtils.replaceD20(workflow.attackRoll, monkLevel);
  await workflow.setAttackRoll(roll);
  return true;
}

async function postMasterOfShiningSteel({
  trigger: { entity: item },
}) {
  await genericUtils.update(item, {
    'system.uses.spent': item.system.uses.spent + 1,
  });
}

async function masterOfShiningSteelWorkflow({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  const altMonk = itemUtils.getItemByIdentifier(
    item.actor,
    'altMonk',
  );
  if (!altMonk) return false;
  const monkLevel = altMonk.system.levels || 0;
  const res1 = await preMasterOfShiningSteel({
    trigger: { entity: item },
    workflow,
    ditem,
  });
  if (!res1) return;
  const res2 = await masterOfShiningSteel({
    trigger: { entity: item },
    workflow,
    monkLevel,
  });
  if (!res2) return;
  await postMasterOfShiningSteel({
    trigger: { entity: item },
  });
}

export const ac55eMasterOfShiningSteel = {
  name: 'Master of Shining Steel',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: masterOfShiningSteelWorkflow,
        priority: 50,
      },
    ],
  },
};
