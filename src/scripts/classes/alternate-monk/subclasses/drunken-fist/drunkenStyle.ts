import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isMartialArtsAttack } from 'martialArts/utils.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!isMartialArtsAttack({ workflow })) return;
  if (!workflow.hitTargets.size) return;
  const {
    utils: { activityUtils, workflowUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  const useActivity = activityUtils.getActivityByIdentifier(feat, 'use', {
    strict: true,
  });
  if (!useActivity) return;
  await workflowUtils.syntheticActivityRoll(useActivity, [token]);
};

const macro: CPRMacro = {
  identifier: 'ac55eDrunkenStyle',
  name: 'Way of the Drunken Fist: Drunken Style',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 100,
      },
    ],
  },
};

export default macro;
