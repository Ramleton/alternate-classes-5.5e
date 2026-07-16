import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isRaging } from '../../utils/rageUtils.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.hitTargets.size) return;
  const {
    utils: { constants, actorUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.meleeAttacks.some((type) => type === actionType)) return;
  const feat = entity as Item<'feat'>;
  const target = workflow.hitTargets.first() as Token;
  if (actorUtils.compareSize(feat.actor!, target.actor!, '>')) return;
  if (!isRaging(feat.actor!)) return;
  await runActivity(feat, 'save', [target]);
};

const macro: CPRMacro = {
  identifier: 'ac55eBestialSpiritsRhino',
  name: 'Path of the Beast Heart: Bestial Spirits Rhino',
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
