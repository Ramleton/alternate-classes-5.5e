import {
  activityUtils,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function preCripplingStrike({
  trigger: { entity: item },
  workflow,
  mysticTechniques,
  practicedStrikes,
}) {
  const martialArts = itemUtils.getEffectByIdentifier(
    workflow.item,
    'ac55eMartialArtsEnchantment',
  );
  if (!martialArts) return false;
  if (!workflowUtils.isAttackType(workflow, 'attack')) return false;
  if (workflowUtils.getActionType(workflow) !== 'mwak') return false;
  if (!workflow.hitTargets.size) return false;
  if (!item.system.uses.value) return false;
  /**
   * Way of the Open Hand monk can use Practiced Strikes instead of Mystic
   * Techniques for this feature
   */
  if (practicedStrikes?.system?.uses?.value) {
    const activity = activityUtils.getActivityByIdentifier(
      practicedStrikes,
      'ac55eFreeStrikeTechnique',
      { strict: true },
    );
    if (activity?.system?.uses?.value) return true;
  }
  if (!mysticTechniques?.system?.uses?.value) return false;
  const selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  return selection;
}

async function cripplingStrike({
  trigger: { entity: item },
  workflow,
}) {
  const saveActivity = activityUtils.getActivityByIdentifier(item, 'save', {
    strict: true,
  });
  if (!saveActivity) return false;
  const saveWorkflow = await workflowUtils.syntheticActivityRoll(
    saveActivity,
    [workflow.hitTargets.first()],
    {
      consumeUsage: true,
    },
  );
  if (!saveWorkflow.saveResults[0].isFailure) return true;
  const buttons = [
    ['Blinded', 'blinded'],
    ['Deafened', 'deafened'],
    ['Silenced', 'silenced'],
  ];
  const selection = await dialogUtils.buttonDialog(
    item.name,
    'Choose one of the following conditions to apply to the target until \
    the end of your next turn:',
    buttons,
    {
      userId: socketUtils.firstOwner(item.actor, true),
    },
  );
  if (!selection) return true;
  const effect = itemUtils.getEffectByIdentifier(
    item,
    selection,
  );
  if (!effect) return false;
  await effectUtils.createEffect(workflow.hitTargets.first().actor, effect);
  return true;
}

async function postCripplingStrike({
  trigger: { entity: item },
  mysticTechniques,
  practicedStrikes,
}) {
  let practicedStrikesActivity;
  if (practicedStrikes) {
    practicedStrikesActivity = activityUtils.getActivityByIdentifier(
      practicedStrikes,
      'ac55eFreeStrikeTechnique',
      { strict: true },
    );
  }
  /**
     * Way of the Open Hand monk can use Practiced Strikes instead of Mystic
     * Techniques for this feature. If both are available, consume Practiced
     * Strikes instead of Mystic Techniques.
     */
  if (
    practicedStrikes?.system?.uses?.value
    && practicedStrikesActivity?.uses?.value
  ) {
    await genericUtils.update(practicedStrikes, {
      'system.uses.spent': practicedStrikes.system.uses.spent + 1,
    });
    await genericUtils.update(practicedStrikesActivity, {
      'uses.spent': practicedStrikesActivity.uses.spent + 1,
    });
  }
  else {
    await genericUtils.update(mysticTechniques, {
      'system.uses.spent': mysticTechniques.system.uses.spent + 1,
    });
  }
  await genericUtils.update(item, {
    'system.uses.spent': item.system.uses.spent + 1,
  });
}

async function cripplingStrikeWorkflow({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  const mysticTechniques = itemUtils.getItemByIdentifier(
    item.actor,
    'mysticTechniques',
  );
  const practicedStrikes = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55ePracticedStrikes',
  );
  const res1 = await preCripplingStrike({
    trigger: { entity: item },
    workflow,
    ditem,
    mysticTechniques,
    practicedStrikes,
  });
  if (!res1) return;
  const res2 = await cripplingStrike({
    trigger: { entity: item },
    workflow,
  });
  if (!res2) return;
  await postCripplingStrike({
    trigger: { entity: item },
    mysticTechniques,
    practicedStrikes,
  });
}

export const ac55eCripplingStrike = {
  name: 'Crippling Strike',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: cripplingStrikeWorkflow,
        priority: 100,
      },
    ],
  },
};
