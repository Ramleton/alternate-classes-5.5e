import { ac55ePackIDs } from 'automation/constants.js';
import {
  getWorkflowProperty,
  setWorkflowProperty,
} from 'automation/workflowUtils.js';
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
    'ac55eSoulTrinkets',
  ) as Item<'feat'>;
  const maxCapacity = soulTrinkets.system.uses!.max;
  const currentCapacity = soulTrinkets.system.uses!.value ?? 0;
  if (currentCapacity >= maxCapacity) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    `A creature in range has died. Create a Soul Trinket? (${currentCapacity}/${maxCapacity})`,
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return;
  if (soulTrinkets) {
    await genericUtils.update(soulTrinkets, {
      'system.uses.spent': soulTrinkets.system.uses!.spent + 1,
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

const graveSmite: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!getWorkflowProperty(workflow, 'sneakAttack')) return;
  const {
    utils: { dialogUtils, genericUtils, itemUtils, socketUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  const soulTrinkets = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eSoulTrinkets',
  ) as Item<'feat'> | undefined;
  if (!soulTrinkets || !soulTrinkets.system.uses!.value) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    'Grave Smite: Use a Soul Trinket?',
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return;
  await genericUtils.update(soulTrinkets, {
    'system.uses.spent': soulTrinkets.system.uses!.spent + 1,
  });
  setWorkflowProperty(workflow, 'sneakAttackDamageType', 'necrotic');
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
      {
        pass: 'attackRollComplete',
        macro: graveSmite,
        priority: 100,
      },
    ],
  },
};

export default macro;
