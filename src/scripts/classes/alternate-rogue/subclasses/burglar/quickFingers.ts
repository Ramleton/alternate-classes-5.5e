import { runActivity } from 'automation/utils.js';
import { getWorkflowProperty } from 'automation/workflowUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { reduceSneakAttack } from '../../utils/sneakAttackUtils.js';

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const {
    utils: { constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.meleeAttacks.some((type) => type === actionType)) return;
  const feat = entity as Item<'feat'>;
  if (!getWorkflowProperty(workflow, feat.actor!, 'sneakAttack')) return;
  const {
    utils: { dialogUtils, socketUtils },
  } = chrisPremades;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  reduceSneakAttack(workflow, feat.actor!, 1);
  const sltWorkflow = await runActivity(feat, 'slt', [workflow.token!]);
  if (!sltWorkflow) return;
  const userTotal = sltWorkflow.saveResults[0].total;
  const target = workflow.hitTargets.first() as Token;
  const prcWorkflow = await runActivity(feat, 'prc', [target]);
  if (!prcWorkflow) return;
  const targetTotal = prcWorkflow.saveResults[0].total;
  const message = userTotal > targetTotal ? 'Success' : 'Failure';
  await ChatMessage.create({
    content: `Quick Fingers: ${message}`,
    speaker: ChatMessage.getSpeaker({ token }),
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eQuickFingers',
  name: 'Burglar: Quick Fingers',
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
