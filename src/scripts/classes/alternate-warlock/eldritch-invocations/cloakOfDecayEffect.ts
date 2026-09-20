import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { DamageActivity } from 'fvtt-types/Activity.js';
import { getPactModifier } from '../utils.js';

const handle: MacroFunction = async ({ trigger: { entity, target } }) => {
  const feat = entity as Item<'feat'>;
  if (!target) return;
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const pactModifier = getPactModifier(feat.actor!);
  const damageActivity = (await getActivityData(feat, 'damage')) as
    DamageActivity | undefined;
  if (!damageActivity) return;
  damageActivity.damage.parts[0].custom.formula = `${pactModifier}`;
  await workflowUtils.syntheticActivityDataRoll(
    damageActivity,
    feat,
    feat.actor!,
    [target],
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eCloakOfDecayEffect',
  name: 'Cloak Of Decay: Effect',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  combat: [
    {
      pass: 'turnStartNear',
      macro: handle,
      priority: 0,
      distance: 5,
    },
  ],
};

export default macro;
