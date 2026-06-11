interface ItemSource {
  revision: number;
  rules: string;
  custom?: string;
  [key: string]: unknown;
}

interface WeaponDamagePart {
  number: number | null;
  denomination: number | null;
  bonus: string;
  types: string[];
  custom: {
    enabled: boolean;
    formula?: string;
  };
  scaling: {
    number: number | null;
    mode?: string;
    formula?: string;
  };
}

export default interface WeaponSystemData {
  description: { value: string; chat: string };
  price: { value: number; denomination: string };
  source: ItemSource;
  identified: boolean;
  unidentified: { description: string };
  container: string | null;
  quantity: number;
  weight: { value: number; units: string };
  rarity: string;
  attunement: string;
  cover: number | null;
  range: {
    value: number | null;
    long: number | null;
    units: string;
    reach: number | null;
  };
  uses: ItemUses;
  damage: {
    versatile: WeaponDamagePart;
    base: WeaponDamagePart;
  };
  armor: { value: number | null };
  hp: {
    value: number | null;
    max: number | null;
    dt: number | null;
    conditions: string;
  };
  type: {
    value: string;
    baseItem: string;
  };
  properties: string[];
  proficient: boolean | null;
  activities: Record<string, Activity>;
  ammunition: Record<string, unknown>;
  mastery: string;
  identifier: string;
  crew: { value: unknown[] };
  attuned: boolean;
  equipped: boolean;
  [key: string]: unknown;
}
