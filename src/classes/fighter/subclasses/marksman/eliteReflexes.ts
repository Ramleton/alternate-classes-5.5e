import { rollUtils } from 'chrisPremades';
import {
    AlternateClasses55e,
} from '../../../../types/alternate-classes-55e';

async function saveBonus(
  { trigger: { entity: item, roll, saveId } },
) {
  const altClassesModule = game
    .modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  if (saveId !== 'dex') return;
  const exploitDie = altClassesModule
    ?.api
    ?.getAlternateMartialExploitDie(item);
  if (!exploitDie) return 0;
  return await rollUtils.addToRoll(roll, `1d${exploitDie.faces}`);
}

async function skillBonus(
  { trigger: { entity: item, roll } },
) {
  const altClassesModule = game
    .modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  if (roll.data.abilityId !== 'dex')
    return;
  const exploitDie = altClassesModule
    ?.api
    ?.getAlternateMartialExploitDie(item);
  if (!exploitDie) return 0;
  return await rollUtils.addToRoll(roll, `1d${exploitDie.faces}`);
}

export const ac55eEliteReflexes = {
  name: 'Elite Reflexes',
  version: '1.3.141',
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
