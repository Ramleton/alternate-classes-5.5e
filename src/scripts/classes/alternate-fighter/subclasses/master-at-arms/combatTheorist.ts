import CPRMacro, { D20Roll, MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const skillBonus: MacroFunction = async ({
  trigger: { entity: item, roll, skillId },
}): Promise<D20Roll | undefined> => {
  if (skillId !== 'his')
    return;
  if (roll.data.abilityId !== 'int')
    return;
  const exploitDie = getAlternateMartialExploitDie(item as Item<'feat'>);
  if (!exploitDie)
    return;
  const { utils: { dialogUtils, rollUtils, socketUtils } } = chrisPremades;
  const selection = await dialogUtils.confirm(
    'Use Combat Theorist?',
    'Gain a bonus to Intelligence (History) checks related to combat, warfare,\
     or armaments of war?', { userId: socketUtils.firstOwner(item, true) });
  if (!selection)
    return;
  return await rollUtils.addToRoll(roll, `1d${exploitDie.faces}`);
};
const macro: CPRMacro = {
  identifier: 'ac55eCombatTheorist',
  name: 'Combat Theorist',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  skill: [{
    pass: 'bonus',
    macro: skillBonus,
    priority: 50,
  }],
};

export default macro;
