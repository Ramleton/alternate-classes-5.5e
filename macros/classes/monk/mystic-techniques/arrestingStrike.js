import {
  activityUtils,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function preArrestingStrike({
  trigger: { entity: item },
  workflow,
  mysticTechniques,
  practicedStrikes,
}) {
  if (!game
    .modules
    .get('alternate-classes-55e')
    .api
    .isMeleeMartialArtsAttack({ workflow })
  ) return false;
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

async function arrestingStrike({
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

async function postArrestingStrike({
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

async function arrestingStrikeWorkflow({
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
  const res1 = await preArrestingStrike({
    trigger: { entity: item },
    workflow,
    ditem,
    mysticTechniques,
    practicedStrikes,
  });
  if (!res1) return;
  const res2 = await arrestingStrike({
    trigger: { entity: item },
    workflow,
  });
  if (!res2) return;
  await postArrestingStrike({
    trigger: { entity: item },
    mysticTechniques,
    practicedStrikes,
  });
}

export const ac55eArrestingStrike = {
  name: 'Arresting Strike',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: arrestingStrikeWorkflow,
        priority: 100,
      },
    ],
  },
};
