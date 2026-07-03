import { getWorkflowProperty } from 'automation/workflowUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const prompt: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!feat.system.uses?.value) return;
  if (!getWorkflowProperty(workflow, 'sneakAttack')) return;
  if (!workflow.hitTargets.size) return;
  const target = workflow.targets.first() as Token;
  const isTargetIncapacitated = target.actor!.statuses.has('incapacitated');
  const isTargetSurprised = target.actor!.statuses.has('surprised');
  // No need to prompt for an auto-critical if Assassinate would run
  if (isTargetIncapacitated || isTargetSurprised) return;
  const {
    utils: { dialogUtils, genericUtils, socketUtils },
  } = chrisPremades;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  workflow.isCritical = true;
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eDeathStrike',
  name: 'Assassin: Death Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
};

export default macro;
