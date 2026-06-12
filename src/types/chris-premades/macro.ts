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
