import CPRMacro, {
  MacroFunction,
  MacroFunctionArgs,
} from 'chris-premades/macro.js';
import { getAltMartialExploitDie } from 'exploits/utils.js';

const bonus: MacroFunction = async ({
  trigger: { entity, roll },
}: MacroFunctionArgs) => {
  if (!roll.options.target) return;
  if (roll.total > roll.options.target) return;
  const feat = entity as Item<'feat'>;
  const exploitDie = getAltMartialExploitDie(feat);
  if (!exploitDie) return;
  const {
    utils: { dialogUtils, rollUtils, socketUtils },
  } = chrisPremades;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    'Spend 1 Psi Point to gain a bonus equal to your Exploit Die?',
    { userId },
  );
  if (!selection) return;
  await rollUtils.addToRoll(roll, `1d${exploitDie.faces}`);
};

const macro: CPRMacro = {
  identifier: 'ac55ePsionicAwakening',
  name: 'Psiknife: Psionic Awakening',
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
  check: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 100,
    },
  ],
};

export default macro;
