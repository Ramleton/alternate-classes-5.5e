export const getMeleeWeapons = (actor: Actor5e): Item<'weapon'>[] => {
  const {
    utils: { constants },
  } = chrisPremades;
  return actor.items
    .filter((i) => i.type === 'weapon')
    .map((i) => i as Item<'weapon'>)
    .filter((i) => i.system.equipped)
    .filter((i) =>
      constants.meleeWeaponTypes.some((type) => type === i.system.type?.value),
    );
};

export const getMeleeWeaponsInRange = (
  source: Token,
  target: Token,
): Item<'weapon'>[] => {
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  return getMeleeWeapons(source.actor!).filter(
    (i) => tokenUtils.getDistance(source, target) <= i.system.range!.reach!,
  );
};

export const getRangedWeapons = (actor: Actor5e): Item<'weapon'>[] => {
  const {
    utils: { constants },
  } = chrisPremades;
  return actor.items
    .filter((i) => i.type === 'weapon')
    .map((i) => i as Item<'weapon'>)
    .filter((i) => i.system.equipped)
    .filter((i) =>
      constants.rangedWeaponTypes.some((type) => type === i.system.type?.value),
    );
};

export const getRangedWeaponsInLongRange = (
  source: Token,
  target: Token,
): Item<'weapon'>[] => {
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  return getRangedWeapons(source.actor!).filter(
    (i) => tokenUtils.getDistance(source, target) <= i.system.range!.long!,
  );
};

export const getRangedWeaponsInRange = (
  source: Token,
  target: Token,
): Item<'weapon'>[] => {
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  return getRangedWeapons(source.actor!).filter(
    (i) => tokenUtils.getDistance(source, target) <= i.system.range!.value!,
  );
};

export const getValidWeapons = (
  source: Token,
  target: Token,
  longRange = false,
): Item<'weapon'>[] => {
  return [
    ...getMeleeWeaponsInRange(source, target),
    ...(longRange
      ? getRangedWeaponsInLongRange(source, target)
      : getRangedWeaponsInRange(source, target)),
  ];
};

export const promptSelectWeapon = async (
  feat: Item<'feat'>,
  weapons: Item<'weapon'>[],
): Promise<Item<'weapon'> | undefined> => {
  const {
    utils: { dialogUtils },
  } = chrisPremades;
  if (weapons.length === 1) return weapons[0];
  const selectedWeapon = (await dialogUtils.selectDocumentDialog(
    `${feat.name}: Select Weapon`,
    'Select a weapon to use',
    weapons,
  )) as Item<'weapon'> | undefined;
  return selectedWeapon;
};
