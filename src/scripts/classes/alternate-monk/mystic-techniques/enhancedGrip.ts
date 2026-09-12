import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { DamageActivity } from 'fvtt-types/Activity.js';

const handle: MacroFunction = async ({
  trigger: { entity, token, target },
}) => {
  if (!target) return;
  const {
    utils: { tokenUtils, workflowUtils },
  } = chrisPremades;
  if (!tokenUtils.isGrappledBy(target, token)) return;
  const feat = entity as Item<'feat'>;
  const grappleDamageActivity = (await getActivityData(feat, 'damage')) as
    DamageActivity | undefined;
  if (!grappleDamageActivity) return;
  await workflowUtils.syntheticActivityDataRoll(
    grappleDamageActivity,
    feat,
    feat.actor!,
    [target],
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eEnhancedGripMysticTechnique',
  name: 'Mystic Techniques: Enhanced Grip',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  combat: [
    {
      pass: 'turnStartNear',
      macro: handle,
      priority: 0,
    },
  ],
};

export default macro;
