import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { SaveActivity } from 'fvtt-types/Activity.js';
import { getKiRemaining } from '../../mystic-techniques/utils.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const feat = entity as Item<'feat'>;
  if (!getKiRemaining(feat.actor!)) return;
  const saveActivity = (await getActivityData(feat, 'save')) as
    SaveActivity | undefined;
  if (!saveActivity) return;
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  await workflowUtils.syntheticActivityRoll(saveActivity, [
    workflow.targets.first() as Token,
  ]);
};

const macro: CPRMacro = {
  identifier: 'ac55eMasterOfReaping',
  name: 'Reaper: Master of Reaping',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
