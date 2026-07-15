import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { handleRollWildSorceryTable } from './wildSorcery.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  const failedSave = workflow.failedSaves.find((t) => t.id === token.id);
  const tookDamage = ditem && ditem.totalDamage;
  if (!tookDamage && !failedSave) return;
  const {
    utils: { actorUtils, dialogUtils, effectUtils, socketUtils },
  } = chrisPremades;
  const rageEffect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eRageEffect',
  );
  if (!rageEffect) return;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor!, true),
  });
  if (!selection) return;
  await actorUtils.setReactionUsed(feat.actor!);
  await handleRollWildSorceryTable(feat.actor!, rageEffect);
};

const macro: CPRMacro = {
  identifier: 'ac55eUnstableSorcery',
  name: 'Path of Sorcery: Unstable Sorcery',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetRollFinished',
        macro: handle,
        priority: 100,
      },
    ],
  },
};

export default macro;
