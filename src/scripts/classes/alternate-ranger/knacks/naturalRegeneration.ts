import {
  applySpellSlotRecovery,
  formatRecoveredSummary,
  promptSpellSlotRecovery,
} from 'automation/spellUtils.js';
import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';

const prompt: MacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!feat.system.uses?.value) return;

  const {
    utils: { dialogUtils, genericUtils, socketUtils },
  } = chrisPremades;

  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;

  const wisMod = feat.actor.system.abilities.wis.mod;
  const budget = Math.max(1, wisMod);

  const slotsToRecover = await promptSpellSlotRecovery(feat.actor, budget);
  if (!slotsToRecover) return;

  await applySpellSlotRecovery(feat.actor, slotsToRecover);
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });

  const plural = slotsToRecover.length > 1 ? 's' : '';

  await dialogUtils.buttonDialog(
    'Natural Recovery',
    `You recovered: ${formatRecoveredSummary(slotsToRecover)} Spell Slot${plural}. You must complete a Long Rest before using this feature again.`,
    [['OK', false]],
    { userId },
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eNaturalRegeneration',
  name: 'Natural Regeneration',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  rest: [
    {
      pass: 'short',
      macro: prompt,
      priority: 100,
    },
  ],
};

export default macro;
