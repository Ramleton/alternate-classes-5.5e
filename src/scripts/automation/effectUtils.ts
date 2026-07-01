import {
  EffectChange,
  EffectData,
  EffectDuration,
  OverTimeEffectData,
  Status,
} from '../../types/effects.js';

const generateOverTimeEffectValue = ({
  actionSave,
  allowIncapacitated = false,
  applyCondition,
  autoRollAttack = false,
  autoRollDamage = false,
  chatFlavor,
  damageBeforeSave = false,
  damageRoll,
  damageType,
  failCount,
  fastForwardAttack = false,
  fastForwardDamage = false,
  killAnim = false,
  label,
  rollMode,
  rollType,
  saveAbility,
  saveCount,
  saveDamage,
  saveDC,
  saveMagic,
  turn,
}: OverTimeEffectData): string => {
  let overTimeEffect = `turn=${turn},label=${label},`;
  if (rollType) overTimeEffect += `rollType=${rollType},`;
  if (allowIncapacitated)
    overTimeEffect += `allowIncapacitated=${allowIncapacitated},`;
  if (applyCondition) overTimeEffect += `applyCondition=${applyCondition},`;
  if (autoRollAttack) overTimeEffect += `autoRollAttack=${autoRollAttack},`;
  if (autoRollDamage) overTimeEffect += `autoRollDamage=${autoRollDamage},`;
  if (chatFlavor) overTimeEffect += `chatFlavor=${chatFlavor},`;
  if (failCount) overTimeEffect += `failCount=${failCount},`;
  if (fastForwardAttack)
    overTimeEffect += `fastForwardAttack=${fastForwardAttack},`;
  if (fastForwardDamage)
    overTimeEffect += `fastForwardDamage=${fastForwardDamage},`;
  if (killAnim) overTimeEffect += `killAnim=${killAnim},`;
  if (rollMode) overTimeEffect += `rollMode=${rollMode},`;
  if (damageRoll) overTimeEffect += `damageRoll=${damageRoll},`;
  if (damageType) overTimeEffect += `damageType=${damageType},`;
  if (damageBeforeSave)
    overTimeEffect += `damageBeforeSave=${damageBeforeSave},`;
  if (saveDamage) overTimeEffect += `saveDamage=${saveDamage},`;
  if (saveCount) overTimeEffect += `saveCount=${saveCount},`;
  if (saveMagic) overTimeEffect += `saveMagic=${saveMagic},`;
  if (actionSave) overTimeEffect += `actionSave=${actionSave},`;
  if (saveAbility) overTimeEffect += `saveAbility=${saveAbility},`;
  if (saveDC) overTimeEffect += `saveDC=${saveDC},`;
  return overTimeEffect;
};

export const generateOverTimeEffectChange = (
  keyLabel: string,
  overTimeEffectData: OverTimeEffectData,
): EffectChange => {
  return {
    key: `flags.midi-qol.OverTime.${keyLabel}`,
    mode: 0,
    value: generateOverTimeEffectValue(overTimeEffectData),
    priority: 20,
  };
};

interface SourceTargetInterdependentEffectData {
  feat: Item<'feat'>;
  target: Token;
  duration?: EffectDuration;
  sourceChanges?: EffectChange[];
  sourceStatuses?: Status[];
  sourceMacros?: { type: string; macros: string[] }[];
  targetChanges?: EffectChange[];
  targetStatuses?: Status[];
  targetMacros?: { type: string; macros: string[] }[];
  concentration?: boolean;
}

type SourceTargetInterdependentEffectsFunction = (
  data: SourceTargetInterdependentEffectData,
) => Promise<void>;

export const applySourceTargetInterdependentEffects: SourceTargetInterdependentEffectsFunction =
  async ({
    feat,
    target,
    duration = {},
    sourceChanges = [],
    sourceStatuses = [],
    sourceMacros = [],
    targetChanges = [],
    targetStatuses = [],
    targetMacros = [],
    concentration = false,
  }) => {
    const {
      utils: { effectUtils },
    } = chrisPremades;
    const featIdentifier = feat.flags['chris-premades']?.info?.['identifier'];
    const sourceEffectData: EffectData = {
      name: `${feat.name}: Source`,
      icon: feat.img!,
      duration,
      origin: feat.actor!.uuid!,
      flags: {
        dae: {
          stackable: 'noneName',
        },
      },
      changes: sourceChanges,
      statuses: sourceStatuses,
    };
    const sourceEffect = await effectUtils.createEffect(
      feat.actor!,
      sourceEffectData,
      {
        concentrationItem: concentration ? feat : undefined,
        identifier: `${featIdentifier}Source`,
        rules: 'modern',
        macros: sourceMacros,
      },
    );
    const targetEffectData: EffectData = {
      name: `${feat.name}: Target`,
      icon: feat.img!,
      duration,
      origin: sourceEffect.uuid!,
      flags: {},
      changes: targetChanges,
      statuses: targetStatuses,
    };
    await effectUtils.createEffect(target.actor!, targetEffectData, {
      parentEntity: sourceEffect,
      strictlyInterdependent: true,
      identifier: `${featIdentifier}Target`,
      rules: 'modern',
      macros: targetMacros,
    });
  };
