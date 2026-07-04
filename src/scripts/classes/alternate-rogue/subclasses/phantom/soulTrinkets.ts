import { ac55ePackIDs } from 'automation/constants.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.damageItem.oldHP) return;
  const {
    utils: {
      actorUtils,
      compendiumUtils,
      dialogUtils,
      genericUtils,
      itemUtils,
      socketUtils,
      tokenUtils,
    },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  const validTargets = workflow.targets
    // Filter out targets that aren't dead
    .filter((t) => t.actor!.system.attributes.hp.value === 0)
    // Filter out targets with less than 5 int
    .filter((t) => t.actor!.system.abilities.int.value >= 5)
    // Filter out targets that are more than 30ft away
    .filter((t) => tokenUtils.getDistance(token, t as Token) <= 30);
  if (!validTargets.size) return;
  const soulTrinkets = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eSoulTrinket',
  ) as Item<'consumable'> | undefined;
  const rogueLevel = feat.actor!.classes['alternate-rogue'].system.levels;
  const maxCapacity = Math.floor(rogueLevel / 2);
  const currentCapacity = soulTrinkets?.system.quantity ?? 0;
  if (currentCapacity >= maxCapacity) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    `A creature in range has died. Create a Soul Trinket? (${currentCapacity}/${maxCapacity})`,
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return;
  if (soulTrinkets) {
    await genericUtils.update(soulTrinkets, {
      'system.quantity': currentCapacity + 1,
    });
  } else {
    const soulTrinketData = await compendiumUtils.getItemFromCompendium(
      ac55ePackIDs.equipment,
      'Soul Trinket',
    );
    const soulTrinket = (
      await itemUtils.createItems(feat.actor!, [soulTrinketData])
    )[0];
    await genericUtils.update(soulTrinket, { 'system.equipped': true });
  }
  await actorUtils.setReactionUsed(feat.actor!);
};

const macro: CPRMacro = {
  identifier: 'ac55eSoulTrinkets',
  name: 'Phantom: Soul Trinkets',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneRollFinished',
        macro: prompt,
        priority: 500,
      },
    ],
  },
};

export default macro;
