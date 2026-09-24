import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity, roll },
  workflow,
}) => {
  if (!roll.isSuccess) return;
  const feat = entity as Item<'feat'>;
  await runActivity(feat, 'damage', [workflow.token!]);
};

const macro: CPRMacro = {
  identifier: 'ac55eThoughtShield',
  name: 'Great Old One: Thought Shield',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetSavesComplete',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
