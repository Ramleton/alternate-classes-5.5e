export const getDivineSmiteDamageType = (
  actor: Actor5e,
): 'radiant' | 'necrotic' | 'thunder' => {
  const { utils: { itemUtils } } = chrisPremades;
  if (itemUtils.getItemByIdentifier(actor, 'ac55eDivineSmiteThunder')) {
    return 'thunder';
  }
  if (itemUtils.getItemByIdentifier(actor, 'ac55eDivineSmiteNecrotic')) {
    return 'necrotic';
  }
  return 'radiant';
};

export const isTargetWithinAuraOfProtection = (
  actor: Actor5e,
  token: Token,
  target: Token,
): boolean => {
  const auraRadius = actor
    .system
    .scale
    ['alternate-paladin']
    ['aura-radius'] as number;
  const { utils: { tokenUtils } } = chrisPremades;
  return tokenUtils.getDistance(token, target) <= auraRadius;
};
