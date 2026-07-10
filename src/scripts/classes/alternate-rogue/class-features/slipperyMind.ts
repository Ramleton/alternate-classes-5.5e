import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const bonus: MacroFunction = async ({ trigger: { entity, roll, saveId } }) => {
  if (!['int', 'wis', 'cha'].some((id) => id === saveId)) return;
  const {
    utils: { rollUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const formula = `1d${exploitDie}`;
  return await rollUtils.addToRoll(roll, formula);
};

const macro: CPRMacro = {
  identifier: 'ac55eSlipperyMind',
  name: 'Slippery Mind',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  save: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 0,
    },
  ],
};

export default macro;
