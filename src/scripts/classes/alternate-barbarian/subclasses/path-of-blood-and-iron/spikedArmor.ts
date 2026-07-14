import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

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
    (i) => i.name === 'Unarmed Strike: Spiked Armor',
  );
  const [unarmedStrikeItem] = (await itemUtils.createItems(feat.actor!, [
    unarmedStrike,
  ])) as Item<'weapon'>[];
  if (!unarmedStrikeItem) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const strMod = feat.actor!.system.abilities.str.mod;
  await genericUtils.update(unarmedStrikeItem, {
    name: 'Unarmed Strike: Spiked Armor',
    system: {
      damage: {
        base: {
          custom: {
            enabled: true,
            formula: `1${exploitDie} + ${strMod}`,
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
