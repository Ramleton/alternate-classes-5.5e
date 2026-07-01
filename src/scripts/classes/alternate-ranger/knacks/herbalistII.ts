import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';

const addPotion: MacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const tempPotion = await fromUuid(
    'Compendium.alternate-classes-55e.equipment.Item.UUifiuVPXx5MVcCh',
  );
  if (!tempPotion) return;
  const itemData = tempPotion.toObject() as Item;
  const {
    utils: { itemUtils },
  } = chrisPremades;
  if (itemUtils.getItemByIdentifier(feat.actor, 'ac55eHerbalistIII')) {
    itemData.system.quantity = Math.max(
      2,
      1 + feat.actor.system.abilities.wis.mod,
    );
  }
  await Item.create(itemData, { parent: feat.actor });
};

const macro: CPRMacro = {
  identifier: 'ac55eHerbalistII',
  name: 'Herbalist II',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: addPotion,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
