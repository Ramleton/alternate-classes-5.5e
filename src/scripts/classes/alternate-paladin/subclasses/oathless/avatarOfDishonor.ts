import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getNearbyTargets, preCheck } from 'exploits/2nd-degree/redirect.js';

const pre = async (feat: Item<'feat'>, workflow: Workflow) => {
  const { utils: { effectUtils } } = chrisPremades;
  const effect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eAvatarOfDishonorEffect',
  );
  if (!effect)
    return;
  if (!preCheck(feat, workflow))
    return;
  const { utils: { dialogUtils, socketUtils } } = chrisPremades;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor!, true),
  });
  return selection;
};

const during = async (feat: Item<'feat'>, workflow: Workflow) => {
  const { utils: { dialogUtils, genericUtils, workflowUtils } } = chrisPremades;
  const nearbyTargets = getNearbyTargets(feat, workflow);
  let selectTarget: Token | undefined;
  if (nearbyTargets.length === 1) {
    selectTarget = nearbyTargets[0];
  }
  else {
    const res = await dialogUtils.selectTargetDialog(
      feat.name,
      'Select a new target for the attack',
      nearbyTargets,
    );
    if (!res)
      return;
    selectTarget = res[0];
  }
  if (!selectTarget)
    return;
  const newAttack = genericUtils.duplicate(workflow.activity);
  if (!newAttack)
    return;
  await workflowUtils.syntheticActivityDataRoll(
    newAttack,
    workflow.item,
    workflow.actor,
    [selectTarget],
  );
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = pre(feat, workflow);
  if (!res1) return;
  await during(feat, workflow);
};

export const avatarOfDishonor: CPRMacro = {
  identifier: 'ac55eAvatarOfDishonor',
  name: 'Oathless: Avatar of Dishonor',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [{
      pass: 'targetAttackRollComplete',
      macro: workflow,
      priority: 910,
    }],
  },
};
