import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { getActivityData, getDamageDetailForToken } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { MidiQOLEvent } from 'chris-premades/macroEvents.js';
import { DamageActivity } from 'fvtt-types/Activity.js';
import { getAuraRadius } from '../../utils/utils.js';

interface PreCallbackArgs {
  feat: Item<'feat'>;
  token: Token;
  workflow: Workflow;
}

type PreAuraDamagedCallback = (
  args: PreCallbackArgs,
) => Promise<Token | undefined>;

const preAuraDamagedCallback: PreAuraDamagedCallback = async ({
  feat,
  token,
  workflow,
}) => {
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

interface DuringCallbackArgs {
  feat: Item<'feat'>;
  target: Token;
  workflow: Workflow;
};

type DuringAuraDamagedCallback = (args: DuringCallbackArgs) => Promise<void>;

const duringAuraDamagedCallback: DuringAuraDamagedCallback = async ({
  feat,
  target,
  workflow,
}) => {
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

export interface AuraDamagedMacroFactoryArgs {
  subclass: string;
  name: string;
  version?: `${number}.${number}.${number}`;
  macroPass?: MidiQOLEvent;
  priority?: number;
  preCallback?: PreAuraDamagedCallback;
  duringCallback?: DuringAuraDamagedCallback;
}

const auraDamagedInsteadFactory = (
  data: AuraDamagedMacroFactoryArgs,
): CPRMacro => {
  const {
    subclass,
    name,
    version = '1.0.0',
    macroPass = 'sceneApplyDamage',
    priority = 911,
    preCallback = preAuraDamagedCallback,
    duringCallback = duringAuraDamagedCallback,
  } = data;
  const workflow: MidiMacroFunction = async ({
    trigger: { entity, token },
    workflow,
  }) => {
    const feat = entity as Item<'feat'>;
    const res1 = await preCallback({ feat, token, workflow });
    if (!res1)
      return false;
    await duringCallback({ feat, target: res1, workflow });
  };

  const label = name.replaceAll(' ', '');
  return {
    identifier: `ac55e${label}`,
    name: `${subclass}: ${name}`,
    source: 'Alternate Classes 5.5e',
    version,
    rules: 'modern',
    midi: {
      actor: [{
        pass: macroPass,
        macro: workflow,
        priority,
      }],
    },
  };
};

export default auraDamagedInsteadFactory;
