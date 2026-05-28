import {
  activityUtils,
  actorUtils,
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  tokenUtils,
  workflowUtils,
} from '../../../../../utils.js';

function preEbbAndFlow({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  if (workflow.hitTargets.size) return false;
  if (actorUtils.hasUsedReaction(item.actor)) return false;
  if (!workflowUtils.isAttackType(workflow, 'attack')) return false;
  const actionType = workflowUtils.getActionType(workflow);
  const allowedAttacks = ['mwak', 'msak'];
  if (!allowedAttacks.includes(actionType)) return false;
  return true;
}

async function ebbAndFlow({ trigger: { entity: item }, workflow, ditem }) {
  let selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  if (!selection) return;
  const buttons = [
    ['Toppling Blow', 'save'],
    ['Swift Reprisal', 'use'],
  ];
  selection = await dialogUtils.buttonDialog(
    item.name,
    'Choose one of the following options:',
    buttons,
    {
      userId: socketUtils.firstOwner(item.actor, true),
    },
  );
  if (!selection) return;
  if (selection === 'save')
    return await topplingBlow({
      trigger: { entity: item },
      workflow,
      ditem,
    });
  return await swiftReprisal({
    trigger: { entity: item },
    workflow,
    ditem,
  });
}

async function topplingBlow({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  const saveActivity = activityUtils.getActivityByIdentifier(item, 'save', {
    strict: true,
  });
  if (!saveActivity) return;
  const sizeMap = {
    tiny: 1,
    sm: 2,
    med: 3,
    lg: 4,
    huge: 5,
    grg: 6,
  };
  const saveAdvantage
    = sizeMap[workflow.actor.system.traits.size]
      > sizeMap[item.actor.system.traits.size];
  let saveAdvantageEffect = undefined;
  if (saveAdvantage) {
    const effectData = {
      name: 'Toppling Blow Advantage',
      icon: item.img,
      origin: item.uuid,
      duration: { turns: 1 },
      changes: [
        {
          key: 'flags.midi-qol.advantage.save.dex',
          mode: 0,
          value: 1,
          priority: 0,
        },
      ],
    };
    saveAdvantageEffect = await effectUtils.createEffect(
      workflow.actor,
      effectData,
    );
  }
  await workflowUtils.syntheticActivityRoll(
    saveActivity,
    [workflow.token],
    {
      consumeUsage: true,
    },
  );
  if (saveAdvantageEffect) await saveAdvantageEffect.delete();
}

async function swiftReprisal({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  const distance = tokenUtils.getDistance(
    workflow.token,
    workflow.hitTargets.first(),
  );
  const validWeapons = item.actor.items.filter(
    i =>
      i.flags['chris-premades']?.info?.identifier === 'unarmedStrike'
      && i.system.range.reach >= distance,
  );
  if (!validWeapons.length) {
    genericUtils.notify('CHRISPREMADES.Macros.TrueStrike.NoWeapons', 'warn');
    return;
  }
  let selectedWeapon;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  }
  else {
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      item.name,
      'CHRISPREMADES.Macros.TrueStrike.SelectWeapon',
      validWeapons,
    );
  }
  const activity = activityUtils.getActivityByIdentifier(
    selectedWeapon,
    'punch',
    {
      strict: true,
    },
  );
  if (!activity) return;
  const activityData = genericUtils.duplicate(activity.toObject());
  const altMonk = itemUtils.getItemByIdentifier(item.actor, 'altMonk');
  if (!altMonk) return;
  const altMonkLevels = altMonk.system.levels;
  const loopCount = altMonkLevels < 17 ? 1 : 2;
  for (let i = 0; i < loopCount; i++) {
    await workflowUtils.syntheticActivityDataRoll(
      activityData,
      selectedWeapon,
      item.actor,
      [workflow.token],
      { consumeResources: true, consumeUsage: true },
    );
  }
}

async function ebbAndFlowWorkflow({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  const res = preEbbAndFlow({
    trigger: { entity: item },
    workflow,
    ditem,
  });
  if (!res) return;
  await ebbAndFlow({
    trigger: { entity: item },
    workflow,
    ditem,
  });
}

export const ac55eEbbAndFlow = {
  name: 'Ebb and Flow',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: ebbAndFlowWorkflow,
        priority: 100,
      },
    ],
  },
};
