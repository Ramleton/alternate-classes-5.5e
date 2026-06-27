export const isQuarry = (feat: Item<'feat'>, target: Token): boolean => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const rangersQuarrySource = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eRangersQuarrySource',
  );
  const rangersQuarryEffect = effectUtils.getEffectByIdentifier(
    target.actor!,
    'ac55eRangersQuarryTarget',
  );
  return !!(
    rangersQuarryEffect &&
    rangersQuarryEffect.origin === rangersQuarrySource?.uuid
  );
};
