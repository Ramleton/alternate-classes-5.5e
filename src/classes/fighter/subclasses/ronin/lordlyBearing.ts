import { itemUtils, rollUtils } from 'chrisPremades';
import {
    AlternateClasses55e,
} from '../../../../types/alternate-classes-55e';

async function skillBonus(
  { trigger: { entity: item, roll, skillId } },
) {
  const altClassesModule = game
    .modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const exiledCourtierHistory = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eExiledCourtierHistory',
  );
  const exiledCourtierInsight = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eExiledCourtierInsight',
  );
  const exiledCourtierPerformance = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eExiledCourtierPerformance',
  );
  const exiledCourtierPersuasion = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eExiledCourtierPersuasion',
  );
  if (!['his', 'ins', 'prf', 'per'].includes(skillId)) return;
  if (skillId === 'his' && !exiledCourtierHistory) return;
  if (skillId === 'ins' && !exiledCourtierInsight) return;
  if (skillId === 'prf' && !exiledCourtierPerformance) return;
  if (skillId === 'per' && !exiledCourtierPersuasion) return;
  const exploitDie = altClassesModule
    ?.api
    ?.getAlternateMartialExploitDie(item);
  if (!exploitDie) return 0;
  return await rollUtils.addToRoll(roll, `1d${exploitDie.faces}`);
}

export const ac55eLordlyBearing = {
  name: 'Lordly Bearing',
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
