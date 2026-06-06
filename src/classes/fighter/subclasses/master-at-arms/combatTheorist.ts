import { dialogUtils, rollUtils, socketUtils } from 'chrisPremades';
import {
  AlternateClasses55eAPI,
} from '../../../../types/alternate-classes-55e';

async function skillBonus(
  { trigger: { entity: item, roll, skillId } },
) {
  const altClassesModule = game
    .modules
    ?.get('alternate-classes-55e') as AlternateClasses55eAPI | undefined;
  if (!altClassesModule) return;
  if (skillId !== 'his') return;
  if (roll.data.abilityId !== 'int')
    return;
  const exploitDie = altClassesModule
    ?.api
    ?.getAlternateMartialExploitDie(item);
  if (!exploitDie) return 0;
  const selection = await dialogUtils.confirm(
    'Use Combat Theorist?',
    'Gain a bonus to Intelligence (History) checks related to combat, warfare,\
     or armaments of war?',
    { userId: socketUtils.firstOwner(item, true) },
  );
  if (!selection) return;
  return await rollUtils.addToRoll(roll, `1d${exploitDie.faces}`);
}

export const ac55eCombatTheorist = {
  name: 'Combat Theorist',
  version: '1.3.141',
  rules: 'modern',
  skill: [
    {
      pass: 'bonus',
      macro: skillBonus,
      priority: 50,
    },
  ],
};
