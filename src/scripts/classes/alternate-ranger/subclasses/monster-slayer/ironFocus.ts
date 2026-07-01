import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getQuarryDie, isQuarry } from '../../utils/quarryUtils.js';

const bonus: MacroFunction = async ({ trigger: { actor, config, roll } }) => {
  const sourceActor = config.midiOptions!.workflow.actor as Actor5e;
  if (!isQuarry(actor!, sourceActor)) return;
  const quarryDie = getQuarryDie(actor!);
  if (!quarryDie) return;
  const {
    utils: { rollUtils },
  } = chrisPremades;
  return await rollUtils.addToRoll(roll, quarryDie);
};

const macro: CPRMacro = {
  identifier: 'ac55eIronFocus',
  name: 'Monster Slayer: Iron Focus',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  save: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 100,
    },
  ],
  skill: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 100,
    },
  ],
  check: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 100,
    },
  ],
};

export default macro;
