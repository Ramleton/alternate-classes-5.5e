import { DamageType } from 'types/damage.js';
import Activity from './Activity.js';
import ItemUses from './ItemUses.js';

interface ItemSource {
  revision: number;
  rules: string;
  custom?: string;
  [key: string]: unknown;
}

export interface WeaponDamagePart {
  number: number | null;
  denomination: number | null;
  bonus: string;
  types: Set<DamageType>;
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

export default class EquipmentSystemData extends foundry.abstract.TypeDataModel<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> {
  declare description: { value: string; chat: string };
  declare price: { value: number; denomination: string };
  declare source: ItemSource;
  declare identified: boolean;
  declare unidentified: { description: string };
  declare container: string | null;
  declare quantity: number;
  declare weight: { value: number; units: string };
  declare rarity: string;
  declare attunement: string;
  declare cover: number | null;
  declare range: {
    value: number | null;
    long: number | null;
    units: string;
    reach: number | null;
  };

  declare uses: ItemUses;
  declare damage: {
    versatile: WeaponDamagePart;
    base: WeaponDamagePart;
  };

  declare armor: { value: number | null };
  declare hp: {
    value: number | null;
    max: number | null;
    dt: number | null;
    conditions: string;
  };

  declare type: {
    value: string;
    subtype: string;
    baseItem: string;
  };

  declare properties: Set<string>;
  declare proficient: boolean | null;
  declare activities: Record<string, Activity>;
  declare ammunition: Record<string, unknown>;
  declare mastery: string;
  declare identifier: string;
  declare crew: { value: unknown[] };
  declare attuned: boolean;
  declare equipped: boolean;

  [key: string]: unknown;
}
