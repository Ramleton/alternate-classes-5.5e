import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import { getKiRemaining, isMeleeMartialArtsAttack } from './utils.js';

const CPRIdentifier = 'ac55eArrestingStrikeMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({
  workflow,
  technique: mysticTechnique,
}) => {
  if (!workflow.hitTargets.size) return false;
  if (!mysticTechnique.system.uses?.value) return false;
  if (!getKiRemaining(workflow.actor)) return false;
  if (!isMeleeMartialArtsAttack(workflow.item, workflow)) return false;
  return true;
};

const handle: MysticTechniqueHandler = async ({
  workflow,
  technique: mysticTechnique,
}) => {
  const target = workflow.hitTargets.first()! as Token;
  await runActivity(mysticTechnique, 'save', [target]);
};

addMysticTechniqueHandler({
  pass: 'attackRollComplete',
  cprIdentifier: CPRIdentifier,
  preCheck,
  handle,
});

const macro: CPRMacro = {
  identifier: CPRIdentifier,
  name: 'Mystic Techniques: Arresting Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
