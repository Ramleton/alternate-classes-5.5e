import { applySourceTargetInterdependentEffects } from 'automation/effectUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const insightfulStrike: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  const target = workflow.hitTargets.first()! as Token;
  await applySourceTargetInterdependentEffects({
    feat,
    target,
    sourceFlags: {
      dae: {
        specialDuration: ['longRest'],
      },
    },
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eInsightfulStrike',
  name: 'Investigator: Insightful Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: insightfulStrike,
        priority: 100,
      },
    ],
  },
};

export default macro;
