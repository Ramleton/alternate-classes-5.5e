import CPRMacro, { D20Roll, MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const checkRest = async (item: Item<'feat'>, roll: D20Roll) => {
  const exploitDie = getAlternateMartialExploitDie(item.actor!);
  if (!exploitDie) return 0;
  const {
    utils: { rollUtils },
  } = chrisPremades;
  return await rollUtils.addToRoll(roll, `1d${exploitDie}`);
};
const saveBonus: MacroFunction = async ({
  trigger: { entity: item, roll, saveId },
}) => {
  if (saveId !== 'dex') return;
  return await checkRest(item as Item<'feat'>, roll);
};
const skillBonus: MacroFunction = async ({
  trigger: { entity: item, roll },
}) => {
  if (roll.data.abilityId !== 'dex') return;
  return await checkRest(item as Item<'feat'>, roll);
};
const macro: CPRMacro = {
  identifier: 'ac55eEliteReflexes',
  name: 'Elite Reflexes',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  save: [
    {
      pass: 'bonus',
      macro: saveBonus,
      priority: 50,
    },
  ],
  skill: [
    {
      pass: 'bonus',
      macro: skillBonus,
      priority: 50,
    },
  ],
};

export default macro;
