import { runActivity } from 'automation/utils.js';
import { getWorkflowProperty } from 'automation/workflowUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const forceSave: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  const target = workflow.hitTargets.first()! as Token;
  const {
    utils: { constants, dialogUtils, socketUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.attacks.some((type) => type === actionType)) return;
  if (!getWorkflowProperty(workflow, 'sneakAttack')) return;
  const nearbyTokens = tokenUtils
    .findNearby(token, 30, 'any', {
      includeIncapacitated: true,
      includeToken: false,
    })
    .filter((t) => t.id !== target.id);
  if (!nearbyTokens.length) return;
  const selection = await dialogUtils.selectTargetDialog(
    feat.name,
    'Force a creature within 30 feet to save?',
    nearbyTokens,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  if (!selection || !selection[0]) return;
  const targetToken = selection[0] as Token;
  await runActivity(feat, 'save', [targetToken]);
};

const macro: CPRMacro = {
  identifier: 'ac55eGraveBolt',
  name: 'Phantom: Grave Bolt',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: forceSave,
        priority: 100,
      },
    ],
  },
};

export default macro;
