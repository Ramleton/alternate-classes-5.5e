import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const applyToQuarry: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!workflow.hitTargets.size) return;
  const target = workflow.hitTargets.first() as Token;
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  if (tokenUtils.getDistance(token, target) > 15) return;
  if (!isQuarry(feat.actor, target.actor!)) return;
  await runActivity(feat, 'apply', [target]);
};

const macro: CPRMacro = {
  identifier: 'ac55eBeguilingStrikes',
  name: 'Fey Wanderer: Beguiling Strikes',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'applyDamage',
        macro: applyToQuarry,
        priority: 100,
      },
    ],
  },
};

export default macro;
