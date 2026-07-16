import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { getExploitUsesRemaining } from 'exploits/utils/exploitUtils.js';
import { spendAlternateMartialExploitUses } from 'exploits/utils/spendExploitUtils.js';
import { isRaging } from '../../utils/rageUtils.js';

const bonus: MacroFunction = async ({ trigger: { entity, roll } }) => {
  const feat = entity as Item<'feat'>;
  if (!isRaging(feat.actor!)) return;
  if ((roll.options.target as number) <= roll.total) return;
  if (!getExploitUsesRemaining(feat)) return;
  const {
    utils: { dialogUtils, rollUtils, socketUtils },
  } = chrisPremades;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    'Use Unwavering Faith?',
    { userId },
  );
  if (!selection) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  await spendAlternateMartialExploitUses(feat, 1);
  return await rollUtils.addToRoll(roll, `1${exploitDie}`);
};

const macro: CPRMacro = {
  identifier: 'ac55eUnwaveringFaith',
  name: 'Path of the Zealot: Unwavering Faith',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  save: [
    {
      pass: 'situational',
      macro: bonus,
      priority: 100,
    },
  ],
};

export default macro;
