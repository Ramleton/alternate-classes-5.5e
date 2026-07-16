export const isRaging = (actor: Actor5e): boolean => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const rage = effectUtils.getEffectByIdentifier(actor, 'ac55eRageEffect');
  return !!rage;
};
