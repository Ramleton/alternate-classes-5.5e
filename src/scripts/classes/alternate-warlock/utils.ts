export const getPactAbility = (actor: Actor5e): 'int' | 'wis' | 'cha' => {
  const warlock = actor.classes['alternate-warlock'];
  return warlock.system.spellcasting.ability as 'int' | 'wis' | 'cha';
};

export const getPactModifier = (actor: Actor5e): number => {
  return actor.system.abilities[getPactAbility(actor)].mod;
};

export const getRemainingPactMagicSlots = (actor: Actor5e): number => {
  const pactMagic = actor.system.spells['ac55ePact'];
  if (!pactMagic) return 0;
  return pactMagic.value;
};
