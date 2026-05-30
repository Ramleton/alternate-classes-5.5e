import {
  activityUtils,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function preFrightfulTouch({
  trigger: { entity: item },
  workflow,
  mysticTechniques,
}) {
  if (!game
    .modules
    .get('alternate-classes-55e')
    .api
    .isMeleeMartialArtsAttack({ workflow })
  ) return false;
  if (!workflow.hitTargets.size) return false;
  if (!item.system.uses.value) return false;
  if (!mysticTechniques?.system?.uses?.value) return false;
  const selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  return selection;
}

async function frightfulTouch({
  trigger: { entity: item },
  workflow,
}) {
  const saveActivity = activityUtils.getActivityByIdentifier(item, 'save', {
    strict: true,
  });
  if (!saveActivity) return false;
  await workflowUtils.syntheticActivityRoll(
    saveActivity,
    [workflow.hitTargets.first()],
    {
      consumeUsage: true,
    },
  );
  return true;
}

async function postFrightfulTouch({
  trigger: { entity: item },
  mysticTechniques,
}) {
  await genericUtils.update(mysticTechniques, {
    'system.uses.spent': mysticTechniques.system.uses.spent + 1,
  });
  await genericUtils.update(item, {
    'system.uses.spent': item.system.uses.spent + 1,
  });
}

async function frightfulTouchWorkflow({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  const mysticTechniques = itemUtils.getItemByIdentifier(
    item.actor,
    'mysticTechniques',
  );
  const res1 = await preFrightfulTouch({
    trigger: { entity: item },
    workflow,
    ditem,
    mysticTechniques,
  });
  if (!res1) return;
  const res2 = await frightfulTouch({
    trigger: { entity: item },
    workflow,
  });
  if (!res2) return;
  await postFrightfulTouch({
    trigger: { entity: item },
    mysticTechniques,
  });
}

export const ac55eFrightfulTouch = {
  name: 'Frightful Touch',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: frightfulTouchWorkflow,
        priority: 100,
      },
    ],
  },
};
