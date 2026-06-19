export const spendDivineFervor = async (
  actor: Actor5e,
  uses = 1,
): Promise<void> => {
  const { utils: { genericUtils, itemUtils } } = chrisPremades;
  const divineFervor = itemUtils.getItemByIdentifier(
    actor,
    'ac55eDivineFervor',
  ) as Item<'feat'> | undefined;
  if (!divineFervor)
    return;
  await genericUtils.update(
    divineFervor,
    { 'system.uses.spent': divineFervor.system.uses!.spent + uses },
  );
};

export const getDivineFervorUses = (actor: Actor5e): number => {
  const { utils: { itemUtils } } = chrisPremades;
  const divineFervor = itemUtils.getItemByIdentifier(
    actor,
    'ac55eDivineFervor',
  ) as Item<'feat'> | undefined;
  if (!divineFervor)
    return 0;
  return divineFervor.system.uses!.value;
};
