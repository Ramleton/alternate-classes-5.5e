import { getActivityData, runActivity } from 'automation/utils.js';
import CPRMacro, { MacroFunction, MidiMacroFunction } from 'chris-premades/macro.js';
import { HealActivity } from 'fvtt-types/Activity.js';
import { getAuraRadius } from '../../utils/utils.js';

const necroticHeal: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  if (!ditem)
    return;
  const { utils: { effectUtils, workflowUtils } } = chrisPremades;
  if (workflowUtils.getActionType(workflow) === 'heal')
    return;
  const effect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eAvatarOfDreadEffect',
  );
  if (!effect)
    return;
  const necroticDamage = workflowUtils.getTotalDamageOfType(
    ditem.damageDetail,
    workflow.targets.first()!.actor!,
    'necrotic',
  );
  if (!necroticDamage)
    return;
  const healActivityData = await getActivityData(
    feat,
    'heal',
  ) as HealActivity;
  healActivityData.healing.custom.formula = Math.floor(necroticDamage / 2) + '';
  await workflowUtils.syntheticActivityDataRoll(
    healActivityData,
    feat,
    feat.actor!,
    [token],
  );
};

const auraDamage: MacroFunction = async ({
  trigger: { entity, token, target },
}) => {
  const feat = entity as Item<'feat'>;
  if (!target)
    return;
  const { utils: { actorUtils, effectUtils, tokenUtils } } = chrisPremades;
  const effect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eAvatarOfDreadEffect',
  );
  if (!effect)
    return;
  const isFrightenedBy = await actorUtils.hasConditionBy(
    feat.actor!,
    target.actor!,
    'frightened',
  );
  if (!isFrightenedBy)
    return;
  const auraRadius = getAuraRadius(feat.actor!);
  if (tokenUtils.getDistance(token, target) > auraRadius)
    return;
  await runActivity(feat, 'damage', [target]);
};

export const avatarOfDread: CPRMacro = {
  identifier: 'ac55eAvatarOfDread',
  name: 'Blackguard: Avatar of Dread',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [{
      pass: 'applyDamage',
      macro: necroticHeal,
      priority: 100,
    }],
  },
  combat: [{
    pass: 'turnStartNear',
    macro: auraDamage,
    priority: 50,
  }],
};
