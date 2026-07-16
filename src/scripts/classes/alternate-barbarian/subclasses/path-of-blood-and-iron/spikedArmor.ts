import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const SPIKED_ARMOR_UNARMED_STRIKE_ITEM_NAME = 'Unarmed Strike: Spiked Armor';

const handle: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const {
    utils: { compendiumUtils, genericUtils, itemUtils },
  } = chrisPremades;
  const unarmedStrike = await compendiumUtils.getItemFromCompendium(
    'chris-premades.CPRItems2024',
    'Unarmed Strike',
  );
  if (!unarmedStrike) return;
  const feat = entity as Item<'feat'>;
  const oldUnarmedStrikeItem = feat.actor!.items.find(
    (i) => i.name === SPIKED_ARMOR_UNARMED_STRIKE_ITEM_NAME,
  );
  const [unarmedStrikeItem] = (await itemUtils.createItems(feat.actor!, [
    unarmedStrike,
  ])) as Item<'weapon'>[];
  if (!unarmedStrikeItem) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  await genericUtils.update(unarmedStrikeItem, {
    name: SPIKED_ARMOR_UNARMED_STRIKE_ITEM_NAME,
    system: {
      damage: {
        base: {
          custom: {
            enabled: true,
            formula: `1${exploitDie}`,
          },
          types: ['piercing'],
        },
      },
    },
  });
  if (oldUnarmedStrikeItem) await oldUnarmedStrikeItem.delete();
};

const macro: CPRMacro = {
  identifier: 'ac55eSpikedArmor',
  name: 'Path of Blood and Iron: Spiked Armor',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 0,
        activities: ['create'],
      },
    ],
  },
};

export default macro;
