import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const weapon = entity as Item<'weapon'>;
  if (!weapon.system.uses?.value) return;
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.update(weapon, {
    'system.uses.spent': weapon.system.uses.spent + 1,
  });
  await runActivity(weapon, 'heal', [token]);
};

const macro: CPRMacro = {
  identifier: 'ac55ePathOfLycanthropyBite',
  name: 'Path Of Lycanthropy: Bite',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 200,
      },
    ],
  },
};

export default macro;
