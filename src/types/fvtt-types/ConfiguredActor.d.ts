import {
  CharacterAttributes,
  D20RollAbility,
} from '../chris-premades/macro.js';
import { DamageType } from '../damage.js';
import { Status } from '../effects.js';
export {};

interface D20RollAbility {
  attack: number;
  value: number;
  proficient: 0 | 0.5 | 1 | 2;
  bonuses: { check: string; save: string };
  check: {
    roll: {
      max: number | null;
      min: number | null;
      mode: number;
      modeCounts: {
        advantages: {
          count: number;
          suppressed: false;
        };
        disadvantages: {
          count: number;
          suppressed: false;
        };
      };
    };
  };
  checkBonus: number;
  checkProf: Proficiency;
  dc: number;
  max: number;
  mod: number;
  save: {
    roll: {
      max: number | null;
      min: number | null;
      mode: number;
    };
    value: number;
  };
  saveBonus: number;
  saveProf: Proficiency;
}

type TraitResistanceImmunityVulnerability = Record<string, unknown>;

interface TraitDamageResistanceImmunityVulnerability extends TraitResistanceImmunityVulnerability {
  value: DamageType[];
}

interface TraitConditionImmunity extends TraitResistanceImmunityVulnerability {
  value: Status[];
}

export type CreatureType =
  | 'aberration'
  | 'beast'
  | 'celestial'
  | 'construct'
  | 'dragon'
  | 'elemental'
  | 'fey'
  | 'fiend'
  | 'giant'
  | 'humanoid'
  | 'monstrosity'
  | 'ooze'
  | 'plant'
  | 'undead';

interface ActorData {
  abilities: {
    str: D20RollAbility;
    dex: D20RollAbility;
    con: D20RollAbility;
    int: D20RollAbility;
    wis: D20RollAbility;
    cha: D20RollAbility;
  };
  attributes: CharacterAttributes;
  bastion: {
    name: string;
    description: string;
  };
  bonuses: {
    abilities: {
      check: string;
      save: string;
      skill: string;
    };
    msak: {
      attack: string;
      damage: string;
    };
    mwak: {
      attack: string;
      damage: string;
    };
    rsak: {
      attack: string;
      damage: string;
    };
    rwak: {
      attack: string;
      damage: string;
    };
    spell: { dc: string };
  };
  currency: {
    cp: number;
    ep: number;
    gp: number;
    pp: number;
    sp: number;
  };
  details: {
    age: string;
    alignment: string;
    appearance: string;
    biography: {
      value: string;
      public: string;
    };
    bond: string;
    eyes: string;
    faith: string;
    flaw: string;
    gender: string;
    hair: string;
    height: string;
    ideal: string;
    originalClass: string;
    skin: string;
    tier: number;
    trait: string;
    type: {
      custom: string;
      value: CreatureType | unknown;
      subtype: string;
      config: {
        icon: string;
        label: string;
        plural: string;
        reference: string;
      };
      label: string;
    };
    weight: string;
    xp: {
      max: number;
      min: number;
      pct: number;
      value: number;
    };
    background: Item;
    race: Item;
  };
  favorites: {
    type: 'activity';
    id: string;
    sort: number;
  }[];
  resources: {
    primary: {
      label: string;
      lr: boolean;
      max: number;
      sr: boolean;
      value: number;
    };
    secondary: {
      label: string;
      lr: boolean;
      max: number;
      sr: boolean;
      value: number;
    };
    tertiary: {
      label: string;
      lr: boolean;
      max: number;
      sr: boolean;
      value: number;
    };
  };
  scale: Record<string, Record<string, unknown>>;
  skills: Record<
    string,
    {
      ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
      bonus: number;
      bonuses: { check: string; passive: string };
      effectValue: number;
      mod: number;
      passive: number;
      prof: Proficiency;
      proficient: 0 | 0.5 | 1 | 2;
      roll: {
        min: number | null;
        max: number | null;
        mode: number;
      };
      total: number;
      value: number;
    }
  >;
  spells: Record<
    string,
    {
      label: string;
      override: undefined;
      type: string;
      value: number;
      max: number;
    }
  >;
  tools: Record<
    string,
    {
      ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
      bonus: number;
      bonuses: { check: string };
      effectValue: number;
      mod: number;
      prof: Proficiency;
      roll: {
        min: number | null;
        max: number | null;
        mode: number;
      };
      total: number;
      value: number;
    }
  >;
  traits: {
    dr: TraitDamageResistanceImmunityVulnerability;
    ci: TraitConditionImmunity;
    di: TraitDamageResistanceImmunityVulnerability;
    dv: TraitDamageResistanceImmunityVulnerability;
    [key: string]: unknown;
  };
}

type ActorDataCommon = Omit<ActorData, 'details'>;

export interface CharacterDetails {
  level: number;
}

export interface NPCDetails {
  cr: number;
}

declare global {
  interface CharacterData extends ActorDataCommon {
    details: ActorData['details'] & CharacterDetails;
  }

  interface NPCData extends ActorDataCommon {
    details: ActorData['details'] & NPCDetails;
    resources: {
      lair: {
        initiative: null;
        inside: boolean;
        value: boolean;
      };
      legact: {
        label: string;
        lr: true;
        max: number;
        spent: number;
        value: number;
      };
      legres: {
        lr: true;
        max: number;
        spent: number;
        value: number;
      };
    };
  }
  class Actor5e<
    SubType extends Actor.SubType = Actor.SubType,
  > extends Actor<SubType> {
    classes: Record<string, Item<'class'>>;
    system: CharacterData | NPCData;
    items: Item[];
    type: 'character' | 'npc';
  }
}
