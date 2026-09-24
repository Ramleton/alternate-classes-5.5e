import { runActivity } from 'automation/utils.js';
import CPRMacro, {
  MidiMacroFunction,
  MidiMacroFunctionArgs,
} from 'chris-premades/macro.js';

const preCheck = ({
  trigger: { token },
  workflow,
  ditem,
}: MidiMacroFunctionArgs): boolean => {
  if (!ditem || ditem.newHP) return false;
  const target = workflow.targets.first() as Token;
  if (token.document.disposition * target.document.disposition === 1)
    return false;
  return true;
};

const handle: MidiMacroFunction = async (data) => {
  if (!preCheck(data)) return;
  const {
    trigger: { entity, token },
  } = data;
  const feat = entity as Item<'feat'>;
  await runActivity(feat, 'heal', [token]);
};

const handleReaction: MidiMacroFunction = async (data) => {
  if (!preCheck(data)) return;
  const {
    trigger: { entity, token },
    workflow,
  } = data;
  const {
    utils: { actorUtils, dialogUtils, socketUtils, tokenUtils },
  } = chrisPremades;
  const target = workflow.targets.first() as Token;
  if (tokenUtils.getDistance(token, target) > 10) return;
  const feat = entity as Item<'feat'>;
  const actor = feat.actor;
  if (!actor) return;
  if (actorUtils.hasUsedReaction(actor)) return;

  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(actor, true),
  });
  if (!selection) return;

  await actorUtils.setReactionUsed(actor);
  await runActivity(feat, 'heal', [token]);
};

const macro: CPRMacro = {
  identifier: 'ac55eDarkVitality',
  name: 'The Fiend: Dark Vitality',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'applyDamage',
        macro: handle,
        priority: 0,
      },
      {
        pass: 'sceneApplyDamage',
        macro: handleReaction,
        priority: 10,
      },
    ],
  },
};

export default macro;
