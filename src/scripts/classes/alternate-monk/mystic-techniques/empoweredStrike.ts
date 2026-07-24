import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import { getKiRemaining, isMeleeMartialArtsAttack } from './utils.js';

const CPRIdentifier = 'ac55eEmpoweredStrikeMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({ workflow, technique }) => {
  if (!workflow.hitTargets.size) return false;
  if (!technique.system.uses?.value) return false;
  if (!getKiRemaining(workflow.actor)) return false;
  if (!isMeleeMartialArtsAttack(workflow.item, workflow)) return false;
  return true;
};

const handle: MysticTechniqueHandler = async ({
  trigger: { entity, token },
  workflow,
  technique,
}) => {
  const target = workflow.hitTargets.first()! as Token;
  const feat = entity as Item<'feat'>;
  const {
    utils: { actorUtils, effectUtils, tokenUtils },
  } = chrisPremades;
  let effect: ActiveEffect | null = null;
  const isSmaller = actorUtils.compareSize(feat.actor!, target.actor!, '<');
  if (isSmaller) {
    const effectData: EffectData = {
      name: 'Empowered Strike: Save Advantage',
      icon: technique.img!,
      duration: { seconds: 1 },
      origin: technique.uuid!,
      flags: {
        dae: {
          stackable: 'noneName',
        },
      },
      changes: [
        {
          key: 'flags.midi-qol.advantage.save.all',
          mode: 0,
          value: 'true',
          priority: 0,
        },
      ],
      statuses: [],
    };
    effect = await effectUtils.createEffect(target.actor!, effectData);
  }
  const saveWorkflow = await runActivity(feat, 'save', [target]);
  if (effect) await effect.delete();
  if (!saveWorkflow?.failedSaves?.size) return;
  const wisMod = feat.actor!.system.abilities.wis.mod ?? 0;
  await tokenUtils.pushToken(token, target, wisMod * 5);
};

addMysticTechniqueHandler({
  pass: 'attackRollComplete',
  cprIdentifier: CPRIdentifier,
  preCheck,
  handle,
});

const macro: CPRMacro = {
  identifier: CPRIdentifier,
  name: 'Mystic Techniques: Empowered Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
