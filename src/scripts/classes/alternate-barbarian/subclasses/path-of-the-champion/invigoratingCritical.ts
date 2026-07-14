import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { HealActivity } from 'fvtt-types/Activity.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.isCritical) return;
  const {
    utils: { constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  const feat = entity as Item<'feat'>;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const healActivity = (await getActivityData(feat, 'heal')) as
    HealActivity | undefined;
  if (!healActivity) return;
  const conMod = feat.actor!.system.abilities.con.mod;
  healActivity.healing.custom.formula = `1${exploitDie} + ${conMod}`;
  await workflowUtils.syntheticActivityDataRoll(
    healActivity,
    feat,
    feat.actor!,
    [token],
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eInvigoratingCritical',
  name: 'Path of the Champion: Invigorating Critical',
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
