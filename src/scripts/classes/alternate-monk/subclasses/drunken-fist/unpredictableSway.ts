import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getKiRemaining } from '../../mystic-techniques/utils.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity: item, token },
  workflow,
}) => {
  if (workflow.hitTargets.size) return;
  const {
    utils: {
      dialogUtils,
      genericUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (!['mwak', 'msak'].includes(workflowUtils.getActionType(workflow))) return;
  const actor = token.actor!;
  if (!getKiRemaining(actor)) return;
  const userId = socketUtils.firstOwner(actor, true);
  const newTargets = tokenUtils
    .findNearby(workflow.token!, workflow.item.system.range.reach, 'any', {
      includeIncapacitated: true,
      includeToken: false,
    })
    .filter((t) => t.id !== token.id);
  let newTarget = await dialogUtils.selectTargetDialog(
    item.name,
    'Tipsy Strike: Choose a new target for the attack.',
    newTargets,
    { userId: userId, skipDeadAndUnconscious: false },
  );
  if (!newTarget) return;
  newTarget = newTarget[0] as Token;
  workflow.aborted = true;
  const feat = item as Item<'feat'>;
  await runActivity(feat, 'use', []);
  const itemData = genericUtils.duplicate(workflow.item.toObject());
  genericUtils.setProperty(itemData, 'flags.chris-premades.setAttackRoll', {
    rollJSON: workflow.attackRoll!.toJSON(),
  });
  const macros =
    workflow.item.flags['chris-premades']?.macros?.midi?.item ?? [];
  macros.push('setAttackRoll');
  genericUtils.setProperty(
    itemData,
    'flags.chris-premades.macros.midi.item',
    macros,
  );
  const newActivity = itemData.system.activities[workflow.activity.id];
  newActivity.range.value = null;
  newActivity.range.override = true;
  if (newActivity.reach) newActivity.reach = null;
  await workflowUtils.syntheticItemDataRoll(itemData, workflow.actor, [
    newTarget,
  ]);
};

const macro: CPRMacro = {
  identifier: 'ac55eUnpredictableSway',
  name: 'Way of the Drunken Fist: Unpredictable Sway',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 100,
      },
    ],
  },
};

export default macro;
