import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';
import { getTokensInMeleeWeaponReach } from 'automation/weaponUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isRuneInvokable, postRune } from './runeUtils.js';

const pre = async (
  feat: Item<'feat'>,
  workflow: Workflow,
  nearbyTokens: Token[],
): Promise<boolean> => {
  const {
    utils: { constants, dialogUtils, tokenUtils, socketUtils },
  } = chrisPremades;
  if (!constants.attacks.includes(workflow.activity?.getActionType()))
    return false;
  if (!workflow.targets.size) return false;
  const target = workflow.targets.first()! as Token;
  if (target.actor!.uuid !== feat.actor!.uuid) {
    const distance = tokenUtils.getDistance(workflow.token!, target);
    if (distance > 30) return false;
    if (!tokenUtils.canSee(workflow.token!, target)) return false;
  }
  if (!nearbyTokens.length) return false;
  const res = isRuneInvokable(feat);
  if (!res.usable) return false;
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
  const {
    utils: { dialogUtils, genericUtils, workflowUtils },
  } = chrisPremades;
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
  if (!newTarget) return false;
  const newAttack = genericUtils.duplicate(workflow.activity);
  if (!newAttack) return false;
  await workflowUtils.syntheticActivityDataRoll(
    newAttack,
    workflow.item,
    workflow.actor,
    [newTarget[0]],
  );
  return true;
};
const workflow: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  if (!workflow.targets.size) return false;
  const nearbyTokens = getTokensInMeleeWeaponReach({
    token: workflow.token!,
    workflow,
  }).filter((t) => t.actor!.id !== workflow.targets.first()!.actor!.id);
  if (!nearbyTokens.length) return false;
  const feat = item as Item<'feat'>;
  const res1 = await pre(feat, workflow, nearbyTokens);
  if (!res1) return;
  const res2 = await during(feat, workflow, nearbyTokens);
  if (!res2) return;
  await postRune(feat);
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
