export const getChosenElement = (actor: Actor5e): Item<'feat'> | undefined => {
  const {
    utils: { itemUtils },
  } = chrisPremades;
  for (const element of ['Air', 'Earth', 'Fire', 'Water']) {
    const feat = itemUtils.getItemByIdentifier(
      actor,
      `ac55eOathOfSplendor${element}`,
    ) as Item<'feat'> | undefined;
    if (feat) {
      return feat;
    }
  }
  return undefined;
};
