import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const handle: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: { compendiumUtils, genericUtils, itemUtils },
  } = chrisPremades;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const unarmedStrike = await compendiumUtils.getItemFromCompendium(
    'chris-premades.CPRItems2024',
    'Unarmed Strike',
  );
  if (!unarmedStrike) return;
  const oldUnarmedStrikeItem = feat.actor!.items.find(
    (i) => i.name === 'Unarmed Strike: Brute',
  );
  const [unarmedStrikeItem] = (await itemUtils.createItems(feat.actor!, [
    unarmedStrike,
  ])) as Item<'weapon'>[];
  if (!unarmedStrikeItem) return;
  await genericUtils.update(unarmedStrikeItem, {
    name: 'Unarmed Strike: Brute',
    system: {
      damage: {
        base: {
          custom: {
            enabled: true,
            formula: `1${exploitDie}`,
          },
        },
      },
    },
  });
  if (oldUnarmedStrikeItem) await oldUnarmedStrikeItem.delete();
};

const macro: CPRMacro = {
  identifier: 'ac55eUnarmedAndDangerous',
  name: 'Path of the Brute: Unarmed And Dangerous',
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
