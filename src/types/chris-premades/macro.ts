/* eslint-disable @typescript-eslint/no-explicit-any */
import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { EffectFlags } from '../effects.js';
import { SkillIdentifier } from '../skills.js';
import { AuraEvent, CombatEvent, D20Event, EffectEvent, MidiQOLEvent, MovementEvent, RestEvent } from './macroEvents.js';

export interface ActiveEffectChange {
  key: string;
  mode: 0 | 1 | 2 | 3 | 4;
  priority: number;
  value: string;
}

export interface ActiveEffectDuration {
  duration: number | null;
  rounds: number | null;
  seconds: number | null;
  startRound: number;
  startTime: number;
  startTurn: number;
  turns: number;
  type: 'turns' | string;
  _combatTime: number;
  combat: null;
  label: string;
  remaining: number;
}

export interface ActiveEffectFlags extends EffectFlags {
  'core': {
    overlay: boolean;
  };
  'chris-premades'?: {
    conditions: string[];
    info?: {
      identifier?: string;
    };
    macros: {
      midi?: {
        actor?: string[];
        item?: string[];
      };
      effect?: string[];
      aura?: string[];
      combat?: string[];
      movement?: string[];
      rest?: string[];
      save?: string[];
      check?: string[];
      skill?: string[];
      death?: string[];
      D20?: string[];
    };
    noAnimation?: boolean;
    rules: 'legacy' | 'modern';
    specialDuration: string[];
    templateEffectActivities: any[];
  };
  'times-up': {
    durationSeconds?: number;
  };
  [key: string]: any;
}

export interface MidiActiveEffect {
  changes: ActiveEffectChange[];
  description: string;
  disabled: boolean;
  duration: ActiveEffectDuration;
  flags: ActiveEffectFlags;
  img: string;
  name: string;
  origin: string;
  sort: number;
  statuses: Set<string>;
  system: object;
}

export interface CastData {
  baseLevel: number;
  castLevel: number;
  saveDC: number;
}

interface Proficiency {
  deterministic: boolean;
  multiplier: number;
  rounding: 'up' | 'down';
  _baseProficiency: number;
  dice: string;
  flat: number;
  hasProficiency: boolean;
  term: string;
}

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

interface ArmorClass {
  armor: number;
  base: number;
  bonus: number;
  calc: 'default' | 'flat' | 'custom' | unknown;
  cover: number;
  dex: number;
  flat: number | null;
  formula: string | undefined;
  label: string | null;
  min: number;
  shield: number;
  value: number;
}

interface HitDice {
  actor: Actor5e;
  classes: Set<Item<'class'>>;
  sizes: Set<number>;
  bySize: {
    d6?: number;
    d8?: number;
    d10?: number;
    d12?: number;
  };
  largest: 'd6' | 'd8' | 'd10' | 'd12';
  largestAvailable: 'd6' | 'd8' | 'd10' | 'd12';
  largestFace: 6 | 8 | 10 | 12;
  max: number;
  pct: number;
  smallest: 'd6' | 'd8' | 'd10' | 'd12';
  smallestAvailable: 'd6' | 'd8' | 'd10' | 'd12';
  smallestFace: 6 | 8 | 10 | 12;
  value: number;
}

interface RollMode {
  min: number | null;
  max: number | null;
  mode: number;
}

interface D20Die {
  isIntermediate: boolean;
  modifiers: unknown[];
  options: {
    advantageMode: number;
    criticalFailure: number;
    criticalSuccess: number;
    elvenAccuracy: boolean;
    flavor: null;
    halflingLucky: boolean;
    maximum: undefined;
    minimum: undefined;
  };
  results: {
    active: boolean;
    hidden: boolean;
    result: number;
  }[];
  _evaluated: boolean;
  _faces: 20;
  _id: string;
  _number: number;
  _root: D20Roll;
  denomination: 'd20';
  dice: unknown[];
  expression: '1d20';
  faces: 20;
  flavor: string;
  formula: '1d20';
  isCriticalFailure: boolean;
  isCriticalSuccess: boolean;
  isDeterministic: boolean;
  isValid: boolean;
  method: string;
  number: 1;
  resolver: unknown;
  total: number;
  values: number[];
}

export interface D20Roll {
  data: {
    Embed: string;
    abilities: {
      cha: D20RollAbility;
      con: D20RollAbility;
      dex: D20RollAbility;
      int: D20RollAbility;
      str: D20RollAbility;
      wis: D20RollAbility;
    };
    abilityId: 'cha' | 'con' | 'dex' | 'int' | 'str' | 'wis';
    actorId: string;
    actorType: 'character' | unknown;
    actorUuid: string;
    attributes: {
      ac: ArmorClass;
      attunement: { max: number; value: number };
      concentration: {
        ability: string;
        bonuses: { save: string };
        limit: number;
        roll: {
          min: number | null;
          max: number | null;
          mode: number;
        };
        save: number;
      };
      death: {
        bonuses: { save: string };
        failure: number;
        roll: {
          min: number | null;
          max: number | null;
          mode: number;
        };
        success: number;
      };
      encumbrance: {
        bonuses: {
          encumbered: string;
          heavilyEncumbered: string;
          maximum: string;
          overall: string;
        };
        encumbered: boolean;
        max: number;
        mod: number;
        multipliers: {
          encumbered: string;
          heavilyEncumbered: string;
          maximum: string;
          overall: string;
        };
        pct: number;
        stops: {
          encumbered: number;
          heavilyEncumbered: number;
        };
        thresholds: {
          encumbered: number;
          heavilyEncumbered: number;
          maximum: number;
        };
      };
      hd: HitDice;
      hp: {
        bonuses: {
          level: string;
          overall: undefined;
        };
        damage: number;
        dt: undefined;
        effectiveMax: number;
        max: number;
        pct: number;
        temp: number;
        tempmax: number;
        value: number;
      };
      init: {
        ability: string;
        bonus: string;
        mod: number;
        prof: Proficiency;
        roll: RollMode;
        score: number;
        total: number;
      };
      inspiration: boolean;
      loyalty: {
        value: undefined;
      };
      movement: {
        bonus: undefined;
        burrow: number;
        climb: number;
        fly: number;
        fromSpecies: { walk: string };
        hover: boolean;
        ignoredDifficultTerrain: Set<string>;
        jump: number;
        max: number;
        slowed: boolean;
        special: undefined;
        speed: number;
        swim: number;
        units: 'ft';
        walk: number;
      };
      prof: number;
      senses: {
        blindsight: number;
        darkvision: number;
        ranges: {
          blindsight: number;
          darkvision: number;
          tremorsense: number;
          truesight: number;
        };
        special: string;
        tremorsense: number;
        truesight: number;
        units: 'ft';
      };
      spell: {
        abilityLabel:
          | 'Strength'
          | 'Dexterity'
          | 'Constitution'
          | 'Intelligence'
          | 'Wisdom'
          | 'Charisma';
        attack: number;
        dc: number;
        mod: number;
      };
      spellcasting: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    };
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
    cfg: {
      actorSizes: {
        grg: {
          abbreviation: 'Gt';
          capacityMultiplier: number;
          hitDie: number;
          label: 'Gargantuan';
          numerical: number;
          token: number;
        };
        huge: {
          abbreviation: 'Hg';
          capacityMultiplier: number;
          hitDie: number;
          label: 'Huge';
          numerical: number;
          token: number;
        };
        lg: {
          abbreviation: 'Lg';
          capacityMultiplier: number;
          hitDie: number;
          label: 'Large';
          numerical: number;
          token: number;
        };
        med: {
          abbreviation: 'Md';
          capacityMultiplier: number;
          hitDie: number;
          label: 'Medium';
          numerical: number;
          token: number;
        };
        sm: {
          abbreviation: 'Sm';
          capacityMultiplier: number;
          hitDie: number;
          label: 'Small';
          numerical: number;
          token: number;
        };
        tiny: {
          abbreviation: 'Tn';
          capacityMultiplier: number;
          hitDie: number;
          label: 'Tiny';
          numerical: number;
          token: number;
        };
      };
      armorClasses: {
        custom: {
          label: 'Custom Formula';
        };
        [key: string]: {
          label: string;
          formula?: string;
        };
      };
      skills: Record<string, {
        ability: string;
        fullKey: string;
        icon: string;
        label: string;
        reference: string;
      }>;
    };
    classes: Record<string, Item<'class'>>;
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
      level: number;
      originalClass: string;
      skin: string;
      tier: number;
      trait: string;
      type: {
        custom: string;
        value: string;
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
    effects: MidiActiveEffect[];
    favorites: {
      type: 'activity';
      id: string;
      sort: number;
    }[];
    flags: Record<string, unknown>;
    midiFlags: Record<string, unknown>;
    mod: number;
    name: string;
    prof: Proficiency;
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
    skills: Record<string, {
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
    }>;
    spells: Record<string, {
      label: string;
      override: undefined;
      type: string;
      value: number;
    }>;
    statuses: Record<string, unknown>;
    statusesSet: Set<string>;
    subclasses: Record<string, Item>;
    tools: Record<string, {
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
    }>;
    traits: Record<string, unknown>;
  };
  options: {
    advantage: boolean;
    advantageMode: number;
    configured: true;
    criticalFailure: number;
    criticalSuccess: number;
    defaultButton: 'normal';
    disadvantage: boolean;
    elvenAccuracy: undefined;
    halflingLucky: undefined;
    reliableTalent: boolean;
    rollMode: 'publicroll' | 'gmroll' | 'blindroll' | 'selfroll';
    rollType: 'skill' | 'check' | 'damage' | 'heal';
    target: unknown | undefined;
  };
  terms: unknown[];
  _dice: unknown[];
  _evaluated: boolean;
  _formula: string;
  _resolver: unknown;
  d20: D20Die;
  dice: unknown[];
  formula: string;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  isCritical: boolean;
  isDeterministic: boolean;
  isFailure: boolean;
  isSuccess: boolean;
  product: number;
  result: string;
  total: number;
  validD20Roll: boolean;
}

export interface Trigger {
  castData?: CastData;
  distance?: number;
  entity: MidiActiveEffect | Item;
  macro: MacroFunction;
  macroName: string;
  name: string;
  priority: number;
  target?: Token;
  token: Token;
  roll: D20Roll;
  saveId: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  skillId: SkillIdentifier;
}

export type MacroFunction = (__0: {
  trigger: Trigger;
  ditem?: any;
}) => Promise<unknown>;

export type MidiMacroFunction = (__0: {
  trigger: Trigger;
  workflow: Workflow;
  ditem?: any;
}) => Promise<unknown>;

export default interface CPRMacro {
  identifier: string;
  name: string;
  source: string;
  version: `${number}.${number}.${number}`;
  rules: 'modern' | 'legacy';
  midi?: {
    actor?: {
      pass: MidiQOLEvent;
      macro: MidiMacroFunction;
      priority: number;
    }[];
    item?: {
      pass: MidiQOLEvent;
      macro: MidiMacroFunction;
      priority: number;
      activities?: string[];
    }[];
  };
  effect?: {
    pass: EffectEvent;
    macro: MacroFunction;
    priority: number;
  }[];
  aura?: {
    pass: AuraEvent;
    macro: MacroFunction;
    priority: number;
  }[];
  combat?: {
    pass: CombatEvent;
    macro: MacroFunction;
    priority: number;
  }[];
  movement?: {
    pass: MovementEvent;
    macro: MacroFunction;
    priority: number;
  }[];
  rest?: {
    pass: RestEvent;
    macro: MacroFunction;
    priority: number;
  }[];
  save?: {
    pass: D20Event;
    macro: MacroFunction;
    priority: number;
  }[];
  check?: {
    pass: D20Event;
    macro: MacroFunction;
    priority: number;
  }[];
  skill?: {
    pass: D20Event;
    macro: MacroFunction;
    priority: number;
  }[];
  death?: {
    pass: D20Event;
    macro: MacroFunction;
    priority: number;
  }[];
  D20?: {
    pass: D20Event;
    macro: MacroFunction;
    priority: number;
  }[];
}
