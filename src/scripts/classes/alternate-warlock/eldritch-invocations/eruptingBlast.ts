import { getActivityData } from 'automation/utils.js';
import { DamageActivity } from 'fvtt-types/Activity.js';
import { DamageType } from 'types/damage.js';
import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../class-features/handling/eldritchBlastHandlerFactory.js';
import { getPactModifier } from '../utils.js';

const preCheck: EldritchBlastPreCheck = async ({ ditem, workflow }) => {
  if (!ditem) return false;
  if (ditem.newHP === ditem.oldHP) return false;
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  const target = workflow.hitTargets.first()! as Token;
  return !!tokenUtils.findNearby(target, 5, 'any', {
    includeIncapacitated: true,
    includeToken: false,
  }).length;
};

const handle: EldritchBlastHandler = async ({ workflow, feature }) => {
  const target = workflow.hitTargets.first()! as Token;
  const {
    utils: { dialogUtils, itemUtils, socketUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const nearbyTokens = tokenUtils.findNearby(target, 5, 'any', {
    includeIncapacitated: true,
    includeToken: false,
  });
  const userId = socketUtils.firstOwner(feature.actor!, true);
  const selectedTokens = (await dialogUtils.selectTargetDialog(
    'Erupting Blast',
    'Choose tokens within 5 feet of the target to damage',
    nearbyTokens,
    { type: 'multiple', skipDeadAndUnconscious: false, userId },
  )) as [Token[], boolean][0];
  const dmgActivity = (await getActivityData(feature, 'damage')) as
    DamageActivity | undefined;
  if (!dmgActivity) return;
  const eldritchBlast = itemUtils.getItemByIdentifier(
    feature.actor!,
    'ac55eEldritchBlast',
  ) as Item<'weapon'> | undefined;
  if (!eldritchBlast) return;
  dmgActivity.damage.parts[0].types = eldritchBlast.system.damage.base
    .types as DamageType[];
  const pactModifier = Math.max(1, getPactModifier(feature.actor!));
  dmgActivity.damage.parts[0].custom.formula = `${pactModifier}`;
  await workflowUtils.syntheticActivityDataRoll(
    dmgActivity,
    feature,
    feature.actor!,
    selectedTokens,
  );
};

addEldritchBlastHandler({
  pass: 'damageRollComplete',
  cprIdentifier: 'ac55eEruptingBlast',
  exclusive: false,
  preCheck,
  handle,
});
