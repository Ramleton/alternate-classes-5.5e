export const DAMAGE_TYPES = [
  'bludgeoning',
  'piercing',
  'slashing',
  'acid',
  'fire',
  'cold',
  'lightning',
  'poison',
  'radiant',
  'necrotic',
  'psychic',
  'thunder',
  'force',
] as const;

export type DamageType = typeof DAMAGE_TYPES[number];
