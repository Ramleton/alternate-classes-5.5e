/* eslint-disable @typescript-eslint/no-explicit-any */
import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { EffectFlags } from '../effects.js';
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
  };
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
  roll: any;
}

export type MacroFunction = (__0: {
  trigger: Trigger;
  ditem?: any;
}) => Promise<void>;

export type MidiMacroFunction = (__0: {
  trigger: Trigger;
  workflow: Workflow;
  ditem?: any;
}) => Promise<void>;

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
