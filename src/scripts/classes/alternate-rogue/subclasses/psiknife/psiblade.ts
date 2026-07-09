import { ac55ePackIDs } from 'automation/constants.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAltMartialExploitDie } from 'exploits/utils.js';
import { WeaponDamagePart } from 'fvtt-types/EquipmentSystemData.js';

const conjurePsiblade: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const {
    utils: { compendiumUtils, genericUtils, itemUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  const exploitDie = getAltMartialExploitDie(feat);
  if (!exploitDie) return;
  const previousPsiblade = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55ePsiBladeItem',
  );
  if (previousPsiblade) await previousPsiblade.delete();
  const psiBlade = (await compendiumUtils.getItemFromCompendium(
    ac55ePackIDs.equipment,
    'Psi Blade',
  )) as Item<'equipment'> | undefined;
  if (!psiBlade) return;
  const [createdPsiBlade] = await itemUtils.createItems(feat.actor!, [
    psiBlade,
  ]);
  const damageData: WeaponDamagePart = {
    number: 1,
    denomination: null,
    bonus: '',
    types: new Set(['psychic']),
    custom: {
      enabled: true,
      formula: `1d${exploitDie.faces}`,
    },
    scaling: {
      number: 1,
      mode: undefined,
      formula: undefined,
    },
  };
  await genericUtils.update(createdPsiBlade, {
    'system.damage.base': damageData,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55ePsiBlade',
  name: 'Psiknife: Psi Blade',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: conjurePsiblade,
        priority: 100,
        activities: ['conjure'],
      },
    ],
  },
};

export default macro;
