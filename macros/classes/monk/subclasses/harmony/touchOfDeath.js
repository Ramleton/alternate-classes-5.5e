async function touchOfDeath({ trigger: { entity: item }, workflow }) {
  if (!workflowUtils.isAttackType(workflow, 'attack')) return;
  if (workflowUtils.getActionType(workflow) !== 'mwak') return;
  if (workflow
    .item
    .flags['chris-premades']
    ?.info
    ?.identifier !== 'unarmedStrike'
  ) return;
  if (!workflow.hitTargets.size) return;
  const opponent = workflow.hitTargets.first();
  const mysticTechniques = itemUtils.getItemByIdentifier(
    item.actor,
    'mysticTechniques',
  );
  if (!mysticTechniques?.system?.uses?.value) return;
  if (!item.system.uses.value) return;
  const selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  if (!selection) return;
  const dmgActivity = activityUtils.getActivityByIdentifier(item, 'damage', {
    strict: true,
  });
  const activityData = genericUtils.duplicate(dmgActivity.toObject());
  // Override damage type to radiant if target is undead
  if (opponent.actor.system.details.type.value === 'undead')
    activityData.damage.parts[0].types = ['radiant'];
  await workflowUtils.syntheticActivityDataRoll(
    activityData,
    item,
    item.actor,
    [opponent],
    { consumeResources: true, consumeUsage: true },
  );
  const altMonk = itemUtils.getItemByIdentifier(item.actor, 'altMonk');
  if (!altMonk) return;
  const altMonkLevels = altMonk.system.levels;
  if (altMonkLevels < 6) return;
  const poisonSelection = await dialogUtils.confirm('Poison creature?');
  if (!poisonSelection) return;
  const effectData = {
    name: `${item.name}: Poisoned`,
    img: workflow.item.img,
    origin: workflow.item.uuid,
    duration: {
      rounds: 2,
    },
    statuses: ['poisoned'],
    flags: {
      dae: {
        specialDuration: ['turnEndSource'],
      },
    },
  };
  await effectUtils.createEffect(
    opponent.actor,
    effectData,
    { identifier: 'touchOfDeathPoisoned' },
  );
}

export const ac55eTouchOfDeath = {
  name: 'Touch of Death',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: touchOfDeath,
        priority: 100,
      },
    ],
  },
};
