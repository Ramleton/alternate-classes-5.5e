import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.hitTargets.size) return;
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (actionType !== 'mwak') return;
  await runActivity(entity as Item<'feat'>, 'use', [workflow.token!]);
};

const macro: CPRMacro = {
  identifier: 'ac55eIntimidatingPresence',
  name: 'Path of the Berserker: Intimidating Presence',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
