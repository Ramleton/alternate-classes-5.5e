import { getSpellData, promptSpellSlotChoice } from 'automation/spellUtils.js';
import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.damageTotal) return;
  const feat = entity as Item<'feat'>;
  const {
    Teleport,
    utils: { actorUtils, dialogUtils, tokenUtils, socketUtils },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  if (!tokenUtils.canSee(token, workflow.token!)) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    `You are about to take damage, use ${feat.name}?`,
    {
      userId,
    },
  );
  if (!selection) return;
  await runActivity(feat, 'use', []);
  const spellData = getSpellData(feat.actor!);
  if (!spellData.hasSpellSlots) return;
  const spendSpellSlot = await dialogUtils.confirm(
    feat.name,
    'Spend a spell slot to teleport 10 feet per level of the spell slot to an unoccupied space you can see?',
    {
      userId,
    },
  );
  if (!spendSpellSlot) return;
  const spellLevel = await promptSpellSlotChoice(feat.actor!);
  if (!spellLevel) return;
  const distance = spellLevel * 10;
  await Teleport.target([token], token, { range: distance });
};

const macro: CPRMacro = {
  identifier: 'ac55eEtherealDefense',
  name: 'Planar Warden: Ethereal Defense',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetDamageRollComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
};

export default macro;
