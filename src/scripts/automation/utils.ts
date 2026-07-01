import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { DamageDetail } from 'chris-premades/macro.js';
import Activity from 'fvtt-types/Activity.js';

export const runActivity = async (
  item: Item<'feat'>,
  activityIdentifier: string,
  targets: Token[],
  options = { consumeResources: true },
): Promise<Workflow | null> => {
  const {
    utils: { activityUtils, workflowUtils, socketUtils },
  } = chrisPremades;
  const activity = activityUtils.getActivityByIdentifier(
    item,
    activityIdentifier,
    {
      strict: true,
    },
  );
  if (!activity) return null;
  const userId = socketUtils.firstOwner(item.actor, true);
  return await workflowUtils.syntheticActivityRoll(activity, targets, {
    ...options,
    userId,
  });
};

export const getActivityData = async (
  item: Item<'feat'>,
  activityIdentifier: string,
): Promise<Activity | undefined> => {
  const {
    utils: { activityUtils, genericUtils },
  } = chrisPremades;
  const activity = activityUtils.getActivityByIdentifier(
    item,
    activityIdentifier,
    { strict: true },
  );
  if (!activity) return;
  return genericUtils.duplicate(activity);
};

export const getDamageDetailForToken = (token: Token, workflow: Workflow) => {
  return workflow.damageList.find(
    (i) => i.targetUuid === token.document.uuid,
  ) as DamageDetail | undefined;
};
