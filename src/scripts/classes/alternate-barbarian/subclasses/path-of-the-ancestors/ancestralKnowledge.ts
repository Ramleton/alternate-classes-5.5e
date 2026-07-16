import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const bonus: MacroFunction = async ({ trigger: { entity, roll } }) => {
  const effect = entity as unknown as ActiveEffect;
  const exploitDie = getAlternateMartialExploitDie(effect.parent as Actor5e);
  if (!exploitDie) return;
  if (!['int', 'wis', 'cha'].some((type) => type === roll.data.abilityId))
    return;
  const {
    utils: { rollUtils },
  } = chrisPremades;
  return await rollUtils.addToRoll(roll, `1${exploitDie}`);
};

const macro: CPRMacro = {
  identifier: 'ac55eAncestralKnowledge',
  name: 'Path of The Ancestors: Ancestral Knowledge',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  skill: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 0,
    },
  ],
  check: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 0,
    },
  ],
};

export default macro;
