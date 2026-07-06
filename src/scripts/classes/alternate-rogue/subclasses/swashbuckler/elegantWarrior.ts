import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const bonus: MacroFunction = async ({ trigger: { entity, roll, skillId } }) => {
  if (!['acr', 'ath', 'prf'].some((id) => id === skillId)) return;
  const {
    utils: { rollUtils },
  } = chrisPremades;
  const exploitDie = getAlternateMartialExploitDie(entity as Item<'feat'>);
  if (!exploitDie) return;
  return await rollUtils.addToRoll(roll, `1d${exploitDie.faces}`);
};

const macro: CPRMacro = {
  identifier: 'ac55eElegantWarrior',
  name: 'Swashbuckler: Elegant Warrior',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  skill: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 100,
    },
  ],
};

export default macro;
