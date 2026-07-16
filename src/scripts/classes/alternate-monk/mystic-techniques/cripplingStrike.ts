import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import { EffectData, Status } from 'types/effects.js';
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

const CPRIdentifier = 'ac55eCripplingStrikeMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return false;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return false;
  if (!getKiRemaining(workflow.actor)) return false;
  if (!isMeleeMartialArtsAttack(workflow.item, workflow)) return false;
  return true;
};

const handle: MysticTechniqueHandler = async ({
  trigger: { entity },
  workflow,
}) => {
  const handler = entity as Item<'feat'>;
  const feat = getMysticTechniqueFromHandler(handler, CPRIdentifier);
  const target = workflow.hitTargets.first()! as Token;
  const saveWorkflow = await runActivity(feat, 'save', [target]);
  if (!saveWorkflow?.failedSaves?.size) return;
  const {
    utils: { dialogUtils, effectUtils, socketUtils },
  } = chrisPremades;
  const options: [string, string][] = [
    ['Blinded', 'blinded'],
    ['Deafened', 'deafened'],
    ['Silenced', 'silenced'],
  ];
  const selection = await dialogUtils.buttonDialog(
    feat.name,
    'Select a condition',
    options,
    {
      userId: socketUtils.firstOwner(feat.actor!, true),
    },
  );
  if (!selection) return;
  const effectData: EffectData = {
    name: `${feat.name}: ${selection.capitalize()}`,
    icon: feat.img,
    duration: { rounds: 2 },
    origin: feat.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
        specialDuration: ['turnStartSource'],
      },
    },
    changes: [],
    statuses: [selection as Status],
  };
  await effectUtils.createEffect(target.actor!, effectData);
};

addMysticTechniqueHandler({
  pass: 'attackRollComplete',
  cprIdentifier: CPRIdentifier,
  preCheck,
  handle,
});

const macro: CPRMacro = {
  identifier: CPRIdentifier,
  name: 'Mystic Techniques: Crippling Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
