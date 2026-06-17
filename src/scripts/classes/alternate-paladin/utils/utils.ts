export const spendDivineFervor = async (
  actor: Actor5e,
  uses = 1,
): Promise<void> => {
  const { utils: { genericUtils, itemUtils } } = chrisPremades;
  const divineFervor = await itemUtils.getItemByIdentifier(
    actor,
    'ac55eDivineFervor',
  );
  if (!divineFervor)
    return;
  await genericUtils.update(
    divineFervor,
    { 'system.uses.spent': divineFervor.system.uses.spent + uses },
  );
};
