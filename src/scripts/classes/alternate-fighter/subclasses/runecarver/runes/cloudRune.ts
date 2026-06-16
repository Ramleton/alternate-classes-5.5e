import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { runActivity } from 'exploits/handling/exploitUtils.js';
import { postRune, preRune } from './runeUtils.js';

const pre = async (
  feat: Item<'feat'>,
  workflow: Workflow,
  nearbyTokens: Token[],
): Promise<boolean> => {
  const { utils: {
    constants,
    dialogUtils,
    tokenUtils,
    socketUtils,
  } } = chrisPremades;
  if (!constants.attacks.includes(workflow.activity?.getActionType()))
    return false;
  if (!workflow.targets.size)
    return false;
  const target = workflow.targets.first()! as Token;
  const distance = tokenUtils.getDistance(workflow.token!, target);
  if (distance > 30)
    return false;
  if (!tokenUtils.canSee(workflow.token!, target))
    return false;
  if (!nearbyTokens.length)
    return false;
  if (!preRune(feat, 'cloud'))
    return false;
  return await dialogUtils.confirm(
    feat.name,
    'A creature you can see is targeted by an attack. Invoke Cloud Rune?',
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
};
const during = async (
  feat: Item<'feat'>,
  workflow: Workflow,
  nearbyTokens: Token[],
) => {
  const { utils: { dialogUtils, genericUtils, workflowUtils } } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.cloud',
    1,
  );
  await runActivity(feat, 'invoke', [workflow.token!]);
  const newTarget = await dialogUtils.selectTargetDialog(
    workflow.item.name,
    'Redirect attack to which token?',
    nearbyTokens,
  );
  if (!newTarget)
    return false;
  const newAttack = genericUtils.duplicate(workflow.activity);
  if (!newAttack)
    return false;
  await workflowUtils.syntheticActivityDataRoll(
    newAttack,
    workflow.item,
    workflow.actor,
    [newTarget[0]],
  );
  return true;
};
const workflow: MidiMacroFunction = async (
  { trigger: { entity: item }, workflow },
) => {
  const attackReach = Math.max(
    workflow.activity?.range?.reach || 0,
    workflow.activity?.range?.value || 0,
  );
  if (!workflow.targets.size)
    return false;
  const target = workflow.targets.first()! as Token;
  const { utils: { tokenUtils } } = chrisPremades;
  const nearbyTokens = tokenUtils.findNearby(
    workflow.token!,
    attackReach,
    'any',
    { includeIncapacitated: true, includeToken: false },
  ).filter(t => t.actor!.id !== target.actor!.id);
  const feat = item as Item<'feat'>;
  const res1 = await pre(feat, workflow, nearbyTokens);
  if (!res1)
    return;
  const res2 = await during(feat, workflow, nearbyTokens);
  if (!res2)
    return;
  await postRune(feat, 'cloud');
};
const macro: CPRMacro = {
  identifier: 'ac55eCloudRune',
  name: 'Runecarver Runes: Cloud Rune',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
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

export default macro;
