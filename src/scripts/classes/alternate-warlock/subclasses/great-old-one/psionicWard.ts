import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses!.value) return;
  const actor = feat.actor;
  if (!actor) return;
  const {
    utils: { actorUtils, dialogUtils, socketUtils },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(actor)) return;
  const userId = socketUtils.firstOwner(actor, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;
  await actorUtils.setReactionUsed(actor);
};

const macro: CPRMacro = {
  identifier: 'ac55ePsionicWard',
  name: 'Great Old One: Psionic Ward',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetPreAttackRollConfig',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
