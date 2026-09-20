import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handleReaction: MidiMacroFunction = async ({
  trigger: { token, entity },
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const {
    utils: { actorUtils, dialogUtils, socketUtils },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor)) return;
  if (!feat.system.uses!.value && !feat.actor.system.spells['ac55ePact'].value)
    return;
  const userId = socketUtils.firstOwner(feat.actor, true);
  if (!userId) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    'Use your reaction to become invisible and teleport?',
    {
      userId,
    },
  );
  if (!selection) return;
  await runActivity(feat, 'apply', [token]);
  await runActivity(feat, 'teleport', [token]);
};

const handleTeleport: MidiMacroFunction = async ({ trigger: { token } }) => {
  const { Teleport } = chrisPremades;
  await Teleport.target([token], token, { range: 60 });
};

const macro: CPRMacro = {
  identifier: 'ac55eMistyEscape',
  name: 'Archfey Patron: Misty Escape',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: handleReaction,
        priority: 0,
      },
    ],
    item: [
      {
        pass: 'rollFinished',
        macro: handleTeleport,
        priority: 0,
        activities: ['teleport'],
      },
    ],
  },
};

export default macro;
