export const SKILL_IDENTIFIERS = [
  'acr',
  'ani',
  'arc',
  'ath',
  'dec',
  'his',
  'ins',
  'inv',
  'itm',
  'med',
  'nat',
  'per',
  'prc',
  'prf',
  'rel',
  'slt',
  'ste',
  'sur',
] as const;

export type SkillIdentifier = typeof SKILL_IDENTIFIERS[number];
