import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getKiRemaining } from './utils.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  if (!getKiRemaining(workflow.actor))
    return genericUtils.notify('No ki remaining', 'warn');
  const feat = entity as Item<'feat'>;
  const wisMod = feat.actor!.system.abilities.wis.mod ?? 0;
};

const macro: CPRMacro = {
  identifier: 'ac55eGentlingTouchMysticTechnique',
  name: 'Mystic Techniques: Gentling Touch',
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
