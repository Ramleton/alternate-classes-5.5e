export const getRangedWeapons = (actor: Actor5e): Item<'weapon'>[] => {
  const { utils: { constants } } = chrisPremades;
  return actor.items
    .filter(i => i.type === 'weapon')
    .filter(i => i.system.equipped)
    .filter(i =>
      constants.rangedWeaponTypes.includes(i.system.type?.value),
    ) as Item<'weapon'>[];
};

export const getMeleeWeapons = (actor: Actor5e): Item<'weapon'>[] => {
  const { utils: { constants } } = chrisPremades;
  return actor.items
    .filter(i => i.type === 'weapon')
    .filter(i => i.system.equipped)
    .filter(i =>
      constants.meleeWeaponTypes.includes(i.system.type?.value),
    ) as Item<'weapon'>[];
};

export const promptSelectWeapon = async (
  feat: Item<'feat'>,
  weapons: Item<'weapon'>[],
): Promise<Item<'weapon'> | undefined> => {
  const { utils: { dialogUtils } } = chrisPremades;
  if (weapons.length === 1)
    return weapons[0];
  const selectedWeapon = await dialogUtils.selectDocumentDialog(
    `${feat.name}: Select Weapon`,
    'Select a weapon to use',
    weapons,
  ) as Item<'weapon'> | undefined;
  return selectedWeapon;
};
