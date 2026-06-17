import { getActivityData } from 'automation/utils.js';
import CPRMacro, { DItem, MidiMacroFunction } from 'chris-premades/macro.js';
import { UtilityActivity } from 'fvtt-types/Activity.js';
import { spendDivineFervor } from '../../utils/utils.js';

const checkForElements = [
  'cold',
  'fire',
  'lightning',
  'poison',
  'thunder',
] as const;

const pre = async (
  feat: Item<'feat'>,
  token: Token,
  target: Token,
  ditem: DItem,
): Promise<boolean> => {
  const { utils: {
    actorUtils,
    dialogUtils,
    socketUtils,
    tokenUtils,
  } } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor!))
    return false;
  const maxDistance = Number(feat
    .actor!
    .system
    .scale
    ['alternate-paladin']
    ?.['aura-radius'] ?? 10);
  if (tokenUtils.getDistance(token, target) > maxDistance)
    return false;
  if (!ditem.isHit)
    return false;
  if (ditem.newHP === ditem.oldHP && ditem.newTempHP === ditem.oldTempHP)
    return false;
  const tokenDisposition = token.document!.disposition;
  const targetDisposition = target.document!.disposition;
  if (
    tokenDisposition !== targetDisposition
    && targetDisposition !== CONST.TOKEN_DISPOSITIONS.NEUTRAL
  )
    return false;
  const matchingDamageDetails = ditem
    .damageDetail
    .filter(d => checkForElements.some(e => e === d.type));
  if (!matchingDamageDetails.length)
    return false;
  const selection = await dialogUtils.confirmUseItem(
    feat,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  if (!selection)
    return false;
  return true;
};

const during = async (
  feat: Item<'feat'>,
  target: Token,
  ditem: DItem,
) => {
  const { utils: { genericUtils, workflowUtils } } = chrisPremades;
  let dmgToReduce = feat.actor!.classes['alternate-paladin'].system.levels
    + feat.actor!.system.abilities.cha.mod;
  const useActivityData = await getActivityData(feat, 'use') as UtilityActivity;
  if (!useActivityData)
    return;
  useActivityData.roll.name = 'Elder Shield: Damage Reduction';
  useActivityData.roll.formula = '' + dmgToReduce;
  await workflowUtils.syntheticActivityDataRoll(
    useActivityData,
    feat,
    feat.actor!,
    [target],
  );
  const originalDetail = genericUtils.deepClone(ditem.damageDetail);
  for (const dmg of originalDetail) {
    if (!checkForElements.some(e => e === dmg.type))
      continue;
    const multiplier = dmg.active.multiplier;
    if (dmg.active.immunity || multiplier === 0)
      continue;
    const distributedReduction = Math.min(dmg.damage, dmgToReduce);
    workflowUtils.modifyDamageAppliedFlat(
      ditem,
      -Math.ceil(distributedReduction * multiplier),
      { type: dmg.type, multiplier },
    );
    dmgToReduce -= distributedReduction;
    if (dmgToReduce <= 0)
      break;
  }
};

const workflow: MidiMacroFunction = async (args) => {
  const { trigger: { entity, token }, workflow, ditem } = args;
  const target = workflow.hitTargets.first()! as Token;
  if (!target)
    return;
  if (!ditem)
    return;
  const feat = entity as Item<'feat'>;
  if (!feat.actor)
    return;
  const res1 = await pre(feat, token, target, ditem);
  if (!res1)
    return;
  await during(feat, target, ditem);
  await spendDivineFervor(feat.actor, 1);
};

const macro: CPRMacro = {
  identifier: 'ac55eElderShield',
  name: 'Oath of the Ancients: Elder Shield',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneApplyDamage',
        macro: workflow,
        priority: 910,
      },
    ],
  },
};

export default macro;
