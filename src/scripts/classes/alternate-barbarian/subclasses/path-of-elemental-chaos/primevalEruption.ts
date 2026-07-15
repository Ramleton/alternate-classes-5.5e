import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { SaveActivity } from 'fvtt-types/Activity.js';
import { getElementDamage } from './heartOfChaos.js';

const handle: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  const {
    utils: { genericUtils, itemUtils, workflowUtils },
  } = chrisPremades;
  const rage = itemUtils.getItemByIdentifier(feat.actor!, 'ac55eRage') as
    Item<'feat'> | undefined;
  if (!rage || !rage.system.uses?.value)
    return genericUtils.notify('You have no uses of Rage remaining.', 'warn');
  const saveActivity = (await getActivityData(feat, 'save')) as
    SaveActivity | undefined;
  if (!saveActivity) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const element = getElementDamage(feat.actor!);
  if (!element) return;
  saveActivity.damage.parts[0].custom.formula = `6${exploitDie}`;
  saveActivity.damage.parts[0].types = [element];
  await workflowUtils.syntheticActivityDataRoll(
    saveActivity,
    feat,
    feat.actor!,
    [],
    { consumeResources: true },
  );
};

const macro: CPRMacro = {
  identifier: 'ac55ePrimevalEruption',
  name: 'Path of Elemental Chaos: Primeval Eruption',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 0,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
