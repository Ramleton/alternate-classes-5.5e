import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import {
  getKiRemaining,
  getMysticTechniqueFromHandler,
  isMeleeMartialArtsAttack,
} from './utils.js';

const CPRIdentifier = 'ac55eArrestingStrikeMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return false;
  const handler = entity as Item<'feat'>;
  const feat = getMysticTechniqueFromHandler(handler, CPRIdentifier);
  if (!feat.system.uses?.value) return false;
  if (!getKiRemaining(workflow.actor)) return false;
  if (!isMeleeMartialArtsAttack(workflow.item, workflow)) return false;
  return true;
};

const handle: MysticTechniqueHandler = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const target = workflow.hitTargets.first()! as Token;
  await runActivity(feat, 'save', [target]);
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
