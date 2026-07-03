import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import {
  getAlternateMartialExploitDie,
  getAltMartialExploitsRemaining,
  spendAlternateMartialExploitUses,
} from 'exploits/utils.js';

const prompt: MacroFunction = async ({ trigger: { entity, token } }) => {
  const feat = entity as Item<'feat'>;
  if (!getAltMartialExploitsRemaining(feat)) return;
  const {
    utils: { genericUtils, dialogUtils, socketUtils, rollUtils },
  } = chrisPremades;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    'Combat has begun, do you want to expend an Exploit Die and add it to your Initiative Roll?',
    { userId },
  );
  if (!selection) return;
  await spendAlternateMartialExploitUses(1, feat);
  const exploitDie = getAlternateMartialExploitDie(feat);
  if (!exploitDie) return;
  const formula = `1d${exploitDie.faces}`;
  const roll = await rollUtils.rollDice(formula, {
    entity: feat.actor!,
    chatMessage: true,
  });
  const combatant = game.combat!.getCombatantsByToken(token.id!)[0];
  const newInitiative = combatant.initiative + roll.roll.total;
  await genericUtils.update(combatant, { initiative: newInitiative }, {}, true);
};

const macro: CPRMacro = {
  identifier: 'ac55eAssassinate',
  name: 'Assassin: Assassinate',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  combat: [
    {
      pass: 'combatStart',
      macro: prompt,
      priority: 100,
    },
  ],
};

export default macro;
