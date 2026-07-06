import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: {
      constants,
      actorUtils,
      dialogUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.attacks.some((type) => type === actionType)) return;
  if (!tokenUtils.canSee(token, workflow.token!)) return;
  const nearbyTokens = tokenUtils
    .findNearby(token, 5, 'any', {
      includeIncapacitated: true,
      includeToken: false,
    })
    .filter((t) => t.id !== workflow.token!.id);
  if (!nearbyTokens.length) return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  const selectedTarget = await dialogUtils.selectTargetDialog(
    feat.name,
    'Select a target to swap with',
    nearbyTokens,
    {
      userId: socketUtils.firstOwner(feat.actor, true),
    },
  );
  if (!selectedTarget || !selectedTarget[0]) return;
  const newTarget = selectedTarget[0];
  const saveWorkflow = await runActivity(feat, 'save', [newTarget]);
  if (!saveWorkflow || !saveWorkflow.failedSaves.size) return;
  await workflowUtils.updateTargets(workflow, [
    ...workflow.targets.filter((t) => t.id !== token.id),
    newTarget,
  ]);
};

const macro: CPRMacro = {
  identifier: 'ac55eDeviousTactics',
  name: 'Mastermind: Devious Tactics',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetPreAttackRollConfig',
        macro: prompt,
        priority: 0,
      },
    ],
  },
};

export default macro;
