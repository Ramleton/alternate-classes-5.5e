async function tipsyStrike({ trigger: { entity: item }, workflow, ditem }) {
  /**
   * Make sure the attack is a melee weapon attack
   */
  if (workflow.hitTargets.size) return;
  if (!workflowUtils.isAttackType(workflow, 'attack')) return;
  if (!['mwak', 'msak'].includes(workflowUtils.getActionType(workflow))) return;
  const mysticTechniques = itemUtils.getItemByIdentifier(
    item.actor,
    'mysticTechniques',
  );
  if (!mysticTechniques?.system?.uses?.value) return;
  const user = socketUtils.firstOwner(workflow.targets.first());
  const userId = user.id;
  const originalTarget = workflow.targets.first();
  const newTargets = tokenUtils
    .findNearby(workflow.token, workflow.item.system.range.reach, 'all', {
      includeIncapacitated: true,
      includeToken: false,
    })
    .filter(t => t.id !== originalTarget.id);
  let newTarget = await dialogUtils.selectTargetDialog(
    item.name,
    genericUtils.format('CHRISPREMADES.Macros.CloudRune.Reaction', {
      item: item.name,
      name: item.parent.name,
    }),
    newTargets,
    { userId: userId, skipDeadAndUnconscious: false, buttons: 'yesNo' },
  );
  if (!newTarget) return;
  newTarget = newTarget[0];
  workflow.aborted = true;
  let itemData = genericUtils.duplicate(workflow.item.toObject());
  delete itemData._id;
  itemData.system.range = {
    value: null,
    long: null,
    units: '',
  };
  const activity = activityUtils.getActivityByIdentifier(item, 'use', {
    strict: true,
  });
  if (!activity) return;
  await workflowUtils.syntheticActivityRoll(activity, [], {
    consumeResources: true,
  });
  genericUtils.setProperty(itemData, 'flags.chris-premades.setAttackRoll', {
    rollJSON: workflow.attackRoll.toJSON(),
  });
  let macros = workflow.item.flags['chris-premades']?.macros?.midi?.item ?? [];
  macros.push('setAttackRoll');
  genericUtils.setProperty(
    itemData,
    'flags.chris-premades.macros.midi.item',
    macros,
  );
  let newActivity = itemData.system.activities[workflow.activity.id];
  newActivity.range.value = null;
  newActivity.range.override = true;
  if (newActivity.reach) newActivity.reach = null;
  await workflowUtils.syntheticItemDataRoll(itemData, workflow.actor, [
    newTarget,
  ]);
}

export const ac55eUnpredictableSway = {
  name: 'Unpredictable Sway',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: tipsyStrike,
        priority: 100,
      },
    ],
  },
};
