import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { getActivityData, getDamageDetailForToken } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageActivity } from 'fvtt-types/Activity.js';
import { getAuraRadius } from '../../utils/utils.js';

const pre = async (
  feat: Item<'feat'>,
  token: Token,
  workflow: Workflow,
): Promise<Token | undefined> => {
  if (!feat.actor)
    return;
  if (!workflow.damageTotal)
    return;
  const { utils: {
    actorUtils,
    dialogUtils,
    socketUtils,
    tokenUtils,
  } } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor))
    return;
  const auraRadius = getAuraRadius(feat.actor);
  const validTargets: Token[] = [];
  for (const target of workflow.hitTargets) {
    if (tokenUtils.getDistance(token, target as Token) > auraRadius)
      continue;
    if ((target as Token).document.disposition !== token.document.disposition)
      continue;
    const damageDetail = getDamageDetailForToken(target as Token, workflow);
    if (!damageDetail?.totalDamage)
      continue;
    validTargets.push(target as Token);
  }
  if (!validTargets.length)
    return;
  const selection = await dialogUtils.confirmUseItem(
    feat,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  if (!selection)
    return;
  const selectedTarget = await dialogUtils.selectTargetDialog(
    'Select Target',
    'Take the damage for which target?',
    validTargets,
    { skipDeadAndUnconscious: false },
  ) as [Token, boolean] | undefined;
  return selectedTarget?.[0];
};

const during = async (
  feat: Item<'feat'>,
  target: Token,
  workflow: Workflow,
): Promise<void> => {
  const { utils: { workflowUtils } } = chrisPremades;
  const damageActivityData = await getActivityData(
    feat,
    'damage',
  ) as DamageActivity;
  if (!damageActivityData)
    return;
  const damageDetail = getDamageDetailForToken(target, workflow);
  const damageTotal = Math.floor(damageDetail!.totalDamage as number);
  workflow.damageList = workflow.damageList.filter(
    i => i.targetUuid !== target.document.uuid,
  );
  damageActivityData.damage.parts.push({
    custom: {
      enabled: false,
      formula: '',
    },
    number: null,
    denomination: null,
    bonus: '' + damageTotal,
    types: [],
    scaling: {
      number: undefined,
    },
  });
  await workflowUtils.syntheticActivityDataRoll(
    damageActivityData,
    feat,
    feat.actor!,
    [],
  );
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const res1 = await pre(feat, token, workflow);
  if (!res1)
    return false;
  await during(feat, res1, workflow);
};

const macro: CPRMacro = {
  identifier: 'ac55eDivineAegis',
  name: 'Divine Aegis',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [{
      pass: 'sceneApplyDamage',
      macro: workflow,
      priority: 991,
    }],
  },
};

export default macro;
