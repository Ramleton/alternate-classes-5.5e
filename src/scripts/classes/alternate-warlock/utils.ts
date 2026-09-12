export const getPactAbility = (actor: Actor5e): 'int' | 'wis' | 'cha' => {
  const warlock = actor.classes['alternate-warlock'];
  return warlock.system.spellcasting.ability as 'int' | 'wis' | 'cha';
};
