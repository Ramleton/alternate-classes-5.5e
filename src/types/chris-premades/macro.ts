/* eslint-disable @typescript-eslint/no-explicit-any */
import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { DamageType } from '../damage.js';
import { EffectFlags } from '../effects.js';
import CharacterData from '../fvtt-types/ConfiguredActor.js';
import { SkillIdentifier } from '../skills.js';
import {
  AuraEvent,
  CombatEvent,
  D20Event,
  EffectEvent,
  ItemEvent,
  MacroEvent,
  MidiQOLEvent,
  MovementEvent,
  RestEvent,
} from './macroEvents.js';

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
  core: {
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
  parent?: Actor5e | unknown;
}

export interface CastData {
  baseLevel: number;
  castLevel: number;
  saveDC: number;
}

export interface Proficiency {
  deterministic: boolean;
  multiplier: number;
  rounding: 'up' | 'down';
  _baseProficiency: number;
  dice: string;
  flat: number;
  hasProficiency: boolean;
  term: string;
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

export interface CharacterAttributes {
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
}

interface D20RollCharacterData extends CharacterData {
  Embed: string;
  abilityId: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  actorId: string;
  actorType: 'character' | unknown;
  actorUuid: string;
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
    skills: Record<
      string,
      {
        ability: string;
        fullKey: string;
        icon: string;
        label: string;
        reference: string;
      }
    >;
  };
  classes: Record<string, Item<'class'>>;
  effects: MidiActiveEffect[];
  flags: Record<string, unknown>;
  midiFlags: Record<string, unknown>;
  mod: number;
  name: string;
  prof: Proficiency;
  statuses: Record<string, unknown>;
  statusesSet: Set<string>;
  subclasses: Record<string, Item>;
  token?: Token;
}

export interface D20Roll {
  data: D20RollCharacterData;
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
    target: number | undefined;
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
  actor?: Actor5e;
  sourceActor?: Actor5e;
  sourceToken?: Token;
  targetToken?: Token;
  roll: D20Roll;
  saveId: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  skillId: SkillIdentifier;
  config: {
    ability?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    advantage?: boolean;
    disadvantage?: boolean;
    midiOptions?: {
      advantage: boolean | undefined;
      advantageByChoice: boolean | undefined;
      disadvantage: boolean | undefined;
      isConcentrationCheck: boolean | undefined;
      isMagicSave: boolean;
      itemCardUuid: string | undefined;
      recomputeAdvantage: boolean;
      rollAbilities: ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')[];
      rollSkills: SkillIdentifier[];
      rollTools: string[];
      saveItemUuid: string | undefined;
      target: number;
      workflow: Workflow;
    };
  };
}

export interface CalcDamageOptions {
  ignore: {
    absorption: Set<DamageType>;
    immunity: Set<DamageType>;
    modification: Set<DamageType>;
    resistance: Set<DamageType>;
    vulnerability: Set<DamageType>;
  };
  invertHealing: boolean;
  midi: {
    applyDamage: boolean;
    challengeModeAR: number;
    criticalSave: boolean;
    fumbleSave: boolean;
    isCritical: boolean;
    isFumble: boolean;
    isHit: boolean;
    itemType: 'item' | unknown;
    save: boolean;
    saveMultiplier: number;
    saved: boolean;
    semiSuperSaver: boolean;
    sourceActorUuid: string;
    superSaver: boolean;
    targetUuid: string;
    totalDamage: number;
    uncannyDodge: undefined;
  };
  midiIgnoreComputed: boolean;
  multiplier: number;
}

export interface DamageDetail {
  active: {
    multiplier: number;
    immunity?: boolean;
    type?: {
      resistance?: boolean;
    };
  };
  damage: number;
  formula: string;
  properties: Set<string>;
  type: DamageType;
  value: number;
  [key: string]: unknown;
}

export interface DItem {
  actorId: string;
  actorUuid: string;
  calcDamageOptions: CalcDamageOptions;
  challengeModeAR: number;
  challengeModeScale: number;
  critical: boolean;
  damageDetail: DamageDetail[];
  damageDetails: {
    bonusDamage: number[];
    calcDamageOptions: CalcDamageOptions;
    combinedDamage: DamageDetail[];
    defaultDamage: DamageDetail[];
    otherDamage: {
      amount: number;
      temp: number;
      tempMax: number;
    };
    rawBonusDamage: unknown[];
    rawcombinedDamage: DamageDetail[];
    rawdefaultDamage: DamageDetail[];
    rawotherDamage: unknown[];
  };
  damageSelection: string;
  details: unknown[];
  healingAdjustedTotalDamage: number;
  hpDamage: number;
  isHit: boolean;
  newHP: number;
  newTempHP: number;
  oldHP: number;
  oldTempHP: number;
  rawDamageDetail: DamageDetail[];
  saved: boolean;
  sceneId: string;
  semiSuperSaver: boolean;
  superSaver: boolean;
  targetUuid: string;
  tempDamage: number;
  totalDamage: number;
  updateOptions: object;
  useDamageDetail: boolean;
  wasHit: boolean;
}

export interface MacroFunctionArgs {
  trigger: Trigger;
  ditem?: DItem;
  options?: {
    _movement?: Record<string, Record<string, unknown>>;
  };
}

export type MacroFunction = (__0: MacroFunctionArgs) => Promise<unknown>;

export interface MidiMacroFunctionArgs extends MacroFunctionArgs {
  workflow: Workflow;
}

export type MidiMacroFunction = (
  __0: MidiMacroFunctionArgs,
) => Promise<unknown>;

interface SharedMacroEventDetails {
  distance?: number;
  disposition?: 'enemy' | 'ally';
  priority: number;
}

export interface MacroEventDetails extends SharedMacroEventDetails {
  pass: MacroEvent;
  macro: MacroFunction;
}

export interface MidiMacroEventDetails extends SharedMacroEventDetails {
  pass: MidiQOLEvent;
  macro: MidiMacroFunction;
}

interface MidiItemMacroEventDetails extends MidiMacroEventDetails {
  activities?: string[];
}

interface CPRMacroEventDetails extends SharedMacroEventDetails {
  macro: MacroFunction;
}

interface ItemMacroEventDetails extends CPRMacroEventDetails {
  pass: ItemEvent;
}

interface EffectMacroEventDetails extends CPRMacroEventDetails {
  pass: EffectEvent;
}

interface AuraMacroEventDetails extends CPRMacroEventDetails {
  pass: AuraEvent;
}

interface CombatMacroEventDetails extends CPRMacroEventDetails {
  pass: CombatEvent;
}

export interface MovementMacroEventDetails extends CPRMacroEventDetails {
  pass: MovementEvent;
}

export interface RestMacroEventDetails extends CPRMacroEventDetails {
  pass: RestEvent;
}

export interface D20MacroEventDetails extends CPRMacroEventDetails {
  pass: D20Event;
}

export default interface CPRMacro {
  identifier: string;
  name: string;
  source: 'Alternate Classes 5.5e' | string;
  version: `${number}.${number}.${number}`;
  rules: 'modern' | 'legacy';
  midi?: {
    actor?: MidiMacroEventDetails[];
    item?: MidiItemMacroEventDetails[];
  };
  item?: ItemMacroEventDetails[];
  effect?: EffectMacroEventDetails[];
  aura?: AuraMacroEventDetails[];
  combat?: CombatMacroEventDetails[];
  movement?: MovementMacroEventDetails[];
  rest?: RestMacroEventDetails[];
  save?: D20MacroEventDetails[];
  check?: D20MacroEventDetails[];
  skill?: D20MacroEventDetails[];
  death?: D20MacroEventDetails[];
  D20?: D20MacroEventDetails[];
}
