import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import { getKiRemaining, isMeleeMartialArtsAttack } from './utils.js';

const CPRIdentifier = 'ac55eDazingStrikeMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({ workflow, technique }) => {
  if (!workflow.hitTargets.size) return false;
  if (!technique.system.uses?.value) return false;
  if (!getKiRemaining(workflow.actor)) return false;
  if (!isMeleeMartialArtsAttack(workflow.item, workflow)) return false;
  return true;
};

const handle: MysticTechniqueHandler = async ({ workflow, technique }) => {
  const target = workflow.hitTargets.first()! as Token;
  await runActivity(technique, 'save', [target]);
};

addMysticTechniqueHandler({
  pass: 'attackRollComplete',
  cprIdentifier: CPRIdentifier,
  preCheck,
  handle,
});

const macro: CPRMacro = {
  identifier: CPRIdentifier,
  name: 'Mystic Techniques: Dazing Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
