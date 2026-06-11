interface ActivityVisibility {
  level: { min?: number | null; max?: number | null };
  requireAttunement: boolean;
  requireIdentification: boolean;
  requireMagic: boolean;
  identifier?: string;
}

interface ConsumptionTarget {
  type: string;
  value: string;
  target: string;
  scaling: Record<string, unknown>;
  [key: string]: unknown;
}

interface OverTimeProperties {
  saveRemoves: boolean;
  rollAs: string;
  preRemoveConditionText: string;
  postRemoveConditionText: string;
}

interface IgnoreTraits {
  idi: boolean;
  idr: boolean;
  idv: boolean;
  ida: boolean;
  idm: boolean;
}

type DamageType
  = | 'bludgeoning'
    | 'piercing'
    | 'slashing'
    | 'acid'
    | 'fire'
    | 'cold'
    | 'force'
    | 'lightning'
    | 'poison'
    | 'thunder'
    | 'necrotic'
    | 'psychic'
    | 'radiant';

interface DamagePart {
  custom: { enabled: boolean; formula: string };
  number: number | null;
  denomination: number | null;
  bonus: string;
  types: DamageType[];
  scaling: { number: number; [key: string]: unknown };
}

interface BaseActivity {
  type: string;
  _id: string;
  img: string;
  sort: number;
  name: string;
  activation: {
    type: string;
    override: boolean;
    condition: string;
    [key: string]: unknown;
  };
  consumption: {
    scaling: { allowed: boolean; [key: string]: unknown };
    spellSlot: boolean;
    targets: ConsumptionTarget[];
    [key: string]: unknown;
  };
  description: {
    chatFlavor: string;
    [key: string]: unknown;
  };
  duration: {
    units: string;
    concentration: boolean;
    override: boolean;
    [key: string]: unknown;
  };
  effects: unknown[];
  flags: Record<string, unknown>;
  range: {
    units: string;
    override: boolean;
    special: string;
    value?: string;
    [key: string]: unknown;
  };
  target: {
    template: {
      contiguous: boolean;
      stationary: boolean;
      units: string;
      type: string;
      count?: string;
      size?: string;
      [key: string]: unknown;
    };
    affects: {
      choice: boolean;
      count?: string;
      type: string;
      special: string;
      [key: string]: unknown;
    };
    override: boolean;
    prompt: boolean;
    [key: string]: unknown;
  };
  uses: ItemUses & { max: string };
  visibility: ActivityVisibility;
  useConditionText: string;
  useConditionReason: string;
  effectConditionText: string;
  macroData: { name: string; command: string };
  ignoreTraits: IgnoreTraits;
  midiProperties: MidiProperties;
  isOverTimeFlag: boolean;
  overTimeProperties: OverTimeProperties;
  otherActivityId: string;
  otherActivityAsParentType: boolean;
  [key: string]: unknown;
}

export interface HealActivity extends BaseActivity {
  type: 'heal';
  healing: {
    types: string[];
    custom: { enabled: boolean; formula: string };
    scaling: { number: number };
    number: number | null;
    denomination: string | null;
    bonus: string;
  };
}

export interface UtilityActivity extends BaseActivity {
  type: 'utility';
  roll: {
    prompt: boolean;
    visible: boolean;
    formula: string;
    name: string;
  };
}

export interface SaveActivity extends BaseActivity {
  type: 'save';
  damage: {
    onSave: 'none' | 'half' | 'full';
    critical: { allow: boolean; [key: string]: unknown };
    parts: DamagePart[];
  };
  save: {
    ability: string[];
    dc: {
      calculation: string;
      formula: string;
    };
  };
  friendlySave: string;
}

interface AttackActivity extends BaseActivity {
  type: 'attack';
  attack: {
    ability: string;
    bonus: string;
    critical: { threshold: number | null };
    flat: boolean;
    type: {
      value: string;
      classification: string;
    };
  };
  damage: {
    critical: { bonus: string };
    includeBase: boolean;
    parts: DamagePart[];
  };
  attackMode: string;
  ammunition: string;
  otherActivityUuid: string;
  attackRollPerTarget: string;
  fumbleThreshold: number;
}

type Activity
  = | AttackActivity
    | HealActivity
    | UtilityActivity
    | SaveActivity
    | BaseActivity;
export default Activity;
