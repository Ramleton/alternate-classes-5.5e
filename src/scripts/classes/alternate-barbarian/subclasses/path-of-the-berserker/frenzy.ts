import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  if (!workflow.hitTargets.size) return;
  const {
    utils: { effectUtils, genericUtils, workflowUtils },
  } = chrisPremades;
  if (!effectUtils.getEffectByIdentifier(feat.actor!, 'ac55eRecklessAttack'))
    return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  await workflowUtils.bonusDamage(workflow, `2${exploitDie}`);
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eFrenzy',
  name: 'Path Of The Berserker: Frenzy',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: handle,
        priority: 100,
      },
    ],
  },
};

export default macro;
