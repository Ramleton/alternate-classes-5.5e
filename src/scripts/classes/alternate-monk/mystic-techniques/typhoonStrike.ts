import { getActivityData } from 'automation/utils.js';
import { getMeleeWeapons } from 'automation/weaponUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { SaveActivity } from 'fvtt-types/Activity.js';
import { DamageType } from 'types/damage.js';
import { getKiRemaining, isMeleeMartialArtsWeapon } from './utils.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const {
    utils: {
      dialogUtils,
      genericUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (!getKiRemaining(workflow.actor)) {
    return genericUtils.notify('No ki remaining', 'warn');
  }
  const meleeWeapons = getMeleeWeapons(workflow.actor)
    .filter((weapon) => isMeleeMartialArtsWeapon(weapon))
    .filter((weapon) => {
      const reach = weapon.system.range.reach!;
      return tokenUtils.findNearby(token, reach, 'any').length;
    });
  if (!meleeWeapons.length)
    return genericUtils.notify('No martial arts melee weapons', 'warn');
  const feat = entity as Item<'feat'>;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  let selectedWeapon: Item<'weapon'> | undefined = undefined;
  if (meleeWeapons.length === 1) {
    // If there's only one weapon in the map
    selectedWeapon = meleeWeapons[0];
  } else {
    // If there's more than one weapon in the map
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      feat.name,
      'Select a melee martial arts weapon to use',
      meleeWeapons,
    );
    if (!selectedWeapon) return;
  }
  let attackDamageType: DamageType | undefined = undefined;
  if (selectedWeapon.system.damage.base.types.length === 1) {
    attackDamageType = selectedWeapon.system.damage.base.types[0] as DamageType;
  } else {
    const damageTypeOptions: [string, string][] =
      selectedWeapon.system.damage.base.types.map((t) => [t.capitalize(), t]);
    attackDamageType = (await dialogUtils.buttonDialog(
      feat.name,
      'Select a damage type',
      damageTypeOptions,
      userId,
    )) as DamageType;
    if (!attackDamageType) return;
  }
  const saveActivity = (await getActivityData(feat, 'save')) as
    SaveActivity | undefined;
  if (!saveActivity) return;
  saveActivity.damage.parts[0].types = [attackDamageType];
  const targets = tokenUtils.findNearby(
    token,
    selectedWeapon.system.range.reach!,
    'any',
  );
  await workflowUtils.syntheticActivityDataRoll(
    saveActivity,
    selectedWeapon,
    feat.actor!,
    targets,
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eTyphoonStrikeMysticTechnique',
  name: 'Mystic Techniques: Typhoon Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 0,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
