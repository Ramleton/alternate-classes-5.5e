import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';
import { DamageType } from './damage.js';

export const STATUSES = [
  'blinded',
  'charmed',
  'concentrating',
  'poisoned',
  'paralyzed',
  'deafened',
  'frightened',
  'stunned',
  'incapacitated',
  'unconscious',
  'diseased',
  'grappled',
  'petrified',
  'prone',
  'exhaustion',
  'restrained',
  'silenced',
] as const;

/**
 * Status effect identifiers in D&D5e
 */
export type Status = (typeof STATUSES)[number];

export interface EffectDuration {
  seconds?: number;
  rounds?: number;
  turns?: number;
}

type DAESpecialDuration =
  | 'isAttacked'
  | 'isDamaged'
  | 'turnStartSource'
  | 'turnEndSource'
  | 'turnStartTarget'
  | 'turnEndTarget'
  | '1Reaction'
  | '1Attack'
  | 'isSave'
  | 'longRest'
  | 'shortRest';

export interface EffectFlags {
  'alternate-classes-55e'?: {
    macros?: {
      wildSorcery?: number;
      chivalricMark?: {
        distance: number;
      };
      enchantedShot?: {
        graspingShot?: {
          originActor?: Actor;
          exploitDie?: ScaleValueTypeDice;
          moved?: boolean;
        };
      };
      exploit?: {
        used?: boolean;
        damage: {
          formula?: string;
          ignoreCrit?: boolean;
          type?: DamageType;
        };
      };
      honorDuel?: {
        sourceUuid?: string;
        targetUuid?: string;
      };
      origin?: string;
      [key: string]: unknown;
    };
  };
  'chris-premades'?: {
    conditions?: string[];
    info?: {
      identifier?: string;
    };
    macros?: {
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
    rules?: 'legacy' | 'modern';
    specialDuration?: string[];
    [key: string]: unknown;
  };
  dae?: {
    disableCondition?: string;
    disableIncapacitated?: boolean;
    durationExpression?: string;
    enableCondition?: string;
    macroRepeat?: 'none' | string;
    showIcon?: boolean;
    specialDuration?: DAESpecialDuration[];
    stackable?: 'noneName' | string;
    [key: string]: unknown;
  };
  dnd5e?: {
    riders: {
      statuses: string[];
    };
  };
  'times-up'?: {
    durationSeconds?: number;
  };
  [key: string]: unknown;
}

/**
 * - 0: Custom
 * - 1: Multiply
 * - 2: Add
 * - 3: Downgrade
 * - 4: Upgrade
 * - 5: Override
 */
type EffectChangeMode = 0 | 1 | 2 | 3 | 4 | 5;

export interface EffectChange {
  key: string;
  mode: EffectChangeMode;
  value: string;
  priority: number;
}

export interface EffectData {
  name: string;
  icon: string | null;
  duration: EffectDuration;
  origin: string;
  flags: EffectFlags;
  changes: EffectChange[];
  statuses: Status[];
}

/**
 * - 'c' Require X consecutive saves/fails
 */
type Consecutive = '' | 'c';
/**
 * - '+' Permanent after X saves/fails
 * - '-' Remove after X saves/fails
 */
type RemovePermanent = '+' | '-';
type OverTimeStatusOverlay = '' | '|overlay';
type OverTimeStatus = '' | `${Status}${OverTimeStatusOverlay}`;

/**
 * Midi OverTime Effect Data
 */
export interface OverTimeEffectData {
  actionSave?: 'dialog' | 'roll';
  allowIncapacitated?: boolean;
  applyCondition?: string;
  autoRollAttack?: boolean;
  autoRollDamage?: boolean;
  chatFlavor?: string;
  damageBeforeSave?: boolean;
  damageRoll?: string;
  damageType?: DamageType;
  failCount?: `${number}${Consecutive}${RemovePermanent}${OverTimeStatus}`;
  fastForwardAttack?: boolean;
  fastForwardDamage?: boolean;
  killAnim?: boolean;
  label: string;
  rollMode?: 'publicroll' | 'gmroll' | 'blindroll' | 'selfroll';
  rollType?: 'damage' | 'skill' | 'check';
  saveAbility?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  saveMagic?: boolean;
  saveCount?: `${number}${Consecutive}${RemovePermanent}${OverTimeStatus}`;
  saveDamage?: 'nodamage' | 'halfdamage' | 'fulldamage';
  saveDC?: number;
  turn: 'start' | 'end';
}

export interface AuraActiveEffectData {
  applyToSelf: boolean;
  bestFormula: string;
  canStack: boolean;
  collisionTypes: Set<'move'>;
  color?: string;
  combatOnly: boolean;
  disableOnHidden: boolean;
  disposition: CONST.TOKEN_DISPOSITIONS;
  distanceFormula: string;
  evaluatePreApply: boolean;
  opacity: number;
  overrideName: string;
  script: string;
  showRadius: boolean;
  stashedChanges: unknown[];
  stashedStatuses: Set<unknown>;
  validationFailures: object;
  parent: EffectData;
}
