export const getChosenElement = (actor: Actor5e): Item<'feat'> | void => {
  const { utils: { itemUtils } } = chrisPremades;
  ['Air', 'Earth', 'Fire', 'Water'].forEach((element) => {
    const feat = itemUtils.getItemByIdentifier(
      actor,
      `ac55eOathOfSplendor${element}`,
    ) as Item<'feat'> | undefined;
    if (feat)
      return feat;
  });
};
