import CPRMacro, { D20Roll, MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const skillBonus: MacroFunction = async ({
  trigger: { entity: item, roll, skillId },
}): Promise<D20Roll | undefined> => {
  if (!['his', 'ins', 'prf', 'per'].includes(skillId)) return;
  const feat = item as Item<'feat'>;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const {
    utils: { itemUtils, rollUtils },
  } = chrisPremades;
  const exiledCourtierHistory = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eExiledCourtierHistory',
  );
  const exiledCourtierInsight = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eExiledCourtierInsight',
  );
  const exiledCourtierPerformance = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eExiledCourtierPerformance',
  );
  const exiledCourtierPersuasion = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eExiledCourtierPersuasion',
  );
  if (skillId === 'his' && !exiledCourtierHistory) return;
  if (skillId === 'ins' && !exiledCourtierInsight) return;
  if (skillId === 'prf' && !exiledCourtierPerformance) return;
  if (skillId === 'per' && !exiledCourtierPersuasion) return;
  return await rollUtils.addToRoll(roll, `1${exploitDie}`);
};
const macro: CPRMacro = {
  identifier: 'ac55eLordlyBearing',
  name: 'Lordly Bearing',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  skill: [
    {
      pass: 'bonus',
      macro: skillBonus,
      priority: 50,
    },
  ],
};

export default macro;
