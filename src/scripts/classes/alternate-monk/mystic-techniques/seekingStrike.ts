import CPRMacro from 'chris-premades/macro.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import { getKiRemaining, isMartialArtsWeapon, spendKi } from './utils.js';

const CPRIdentifier = 'ac55eSeekingStrikeMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({ workflow }) => {
  if (!getKiRemaining(workflow.actor)) return false;
  if (!isMartialArtsWeapon(workflow.item)) return false;
  console.log(workflow);
  return (
    workflow.attackRoll!.total! <
    workflow.targets.first()!.actor!.system.attributes.ac.value
  );
};

const handle: MysticTechniqueHandler = async ({ workflow }) => {
  await spendKi(workflow.actor, 1);
  await workflow.setAttackRoll(await workflow.attackRoll!.reroll());
};

addMysticTechniqueHandler({
  pass: 'postAttackRoll',
  cprIdentifier: CPRIdentifier,
  exclusive: false,
  preCheck,
  handle,
});

const macro: CPRMacro = {
  identifier: CPRIdentifier,
  name: 'Mystic Techniques: Seeking Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
