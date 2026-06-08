import { Workflow } from '@midi-qol/types/module/Workflow';
import {
  activityUtils,
  constants,
  dialogUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  tokenUtils,
  workflowUtils,
} from 'chrisPremades';
import { AlternateClasses55e } from '../../../../types/alternate-classes-55e';

async function pre(
  item,
  workflow: Workflow,
  nearbyTokens: Token[],
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const inscriptions = item.actor.items.filter(i =>
    itemUtils.getEffectByIdentifier(i, 'ac55eCloudRuneInscription'));
  if (inscriptions.length < 2) return false;
  if (!constants.attacks.includes(workflow.activity?.getActionType()))
    return false;
  if (!workflow.targets.size) return false;
  const actorFlags = item.actor.flags['alternate-classes-55e'];
  if (actorFlags?.macros?.runeCarver?.cloud)
    return false;
  if (item.system.uses.spent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elderInsight: any = itemUtils.getItemByIdentifier(
      item.actor,
      'ac55eElderInsight',
    );
    if (!elderInsight) return false;
    if (actorFlags?.macros?.runeCarver?.elderInsight?.cloud) return false;
    if (!altClassesModule.api.getAltMartialExploitsRemaining(item))
      return false;
  }
  const target = workflow.targets.first()! as Token;
  const distance = tokenUtils.getDistance(workflow.token!, target);
  if (distance > 30) return false;
  if (!tokenUtils.canSee(workflow.token!, target)) return false;
  if (!nearbyTokens.length) return false;
  return await dialogUtils.confirm(
    item.name,
    'A creature you can see is targeted by an attack. Invoke Cloud Rune?',
    { userId: socketUtils.firstOwner(item.actor, true) },
  );
}

async function during(
  item,
  workflow: Workflow,
  nearbyTokens: Token[],
): Promise<boolean> {
  await genericUtils.setFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.runeCarver.cloud',
    1,
  );
  const useActivity = activityUtils.getActivityByIdentifier(
    item,
    'invokeCloudRune',
    { strict: true },
  );
  if (!useActivity) return false;
  await workflowUtils.syntheticActivityRoll(
    useActivity,
    [workflow.token!],
  );
  const newTarget = await dialogUtils.selectTargetDialog(
    workflow.item.name,
    'Redirect attack to which token?',
    nearbyTokens,
  );
  if (!newTarget) return false;
  const newAttack = genericUtils.duplicate(workflow.activity);
  if (!newAttack) return false;
  await workflowUtils.syntheticActivityDataRoll(
    newAttack,
    workflow.item,
    workflow.actor,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [newTarget[0] as any],
  );
  return true;
}

async function post(
  item,
  altClassesModule: AlternateClasses55e,
): Promise<void> {
  if (item.system.uses.spent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elderInsight: any = itemUtils.getItemByIdentifier(
      item.actor,
      'ac55eElderInsight',
    );
    if (!elderInsight) return;
    await genericUtils.setFlag(
      item.actor,
      'alternate-classes-55e',
      'macros.runeCarver.elderInsight.cloud',
      1,
    );
    altClassesModule.api.spendAlternateMartialExploitUses(1, item);
  }
  else {
    await item.update({ 'system.uses.spent': item.system.uses.spent + 1 });
  }
  await genericUtils.unsetFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.runeCarver.cloud',
  );
}

async function workflow({
  trigger: { entity: item },
  workflow,
}) {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const attackReach = Math.max(
    workflow.activity?.range?.reach || 0,
    workflow.activity?.range?.value || 0,
  );
  if (!workflow.targets.size) return false;
  const target = workflow.targets.first()! as Token;
  const nearbyTokens = tokenUtils.findNearby(
    workflow.token!,
    attackReach,
    'any',
    { includeIncapacitated: true, includeToken: false },
  ).filter(t => t.actor.id !== target.actor.id);
  const res1 = await pre(item, workflow, nearbyTokens, altClassesModule);
  if (!res1) return;
  const res2 = await during(item, workflow, nearbyTokens);
  if (!res2) return;
  await post(item, altClassesModule);
}

export const ac55eInvokeCloudRune = {
  name: 'Cloud Rune: Invoke',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'scenePreambleComplete',
        macro: workflow,
        priority: 100,
      },
    ],
  },
};
