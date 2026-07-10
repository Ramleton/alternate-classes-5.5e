import { generateOverTimeEffectChange } from 'automation/effectUtils.js';
import {
  EffectChange,
  EffectData,
  EffectDuration,
  Status,
} from 'types/effects.js';

interface EnchantedShotEffectArgs {
  item: Item<'feat'>;
  nameSuffix: string;
  identifierSuffix: string;
  statuses?: Status[];
  changes?: EffectChange[];
  duration?: EffectDuration;
  // For OverTime effects
  saveDC: number;
  saveAbility?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  actionSave?: 'dialog' | 'roll';
}

export const createEnchantedShotTargetEffectData = ({
  item,
  nameSuffix,
  identifierSuffix,
  statuses = [],
  changes = [],
  duration = { seconds: 60 },
  saveDC,
  saveAbility = 'con',
  actionSave,
}: EnchantedShotEffectArgs): EffectData => {
  const effectData: EffectData = {
    name: `${item.name}: ${nameSuffix}`,
    icon: item.img,
    origin: item.uuid!,
    duration,
    flags: {
      dae: { stackable: 'noneName' },
      'chris-premades': { info: { identifier: `ac55e${identifierSuffix}` } },
    },
    statuses,
    changes,
  };

  if (saveDC && identifierSuffix.includes('ShotEffect')) {
    // Example logic for OverTime
    const overTimeChange = generateOverTimeEffectChange(identifierSuffix, {
      label: `${item.name}: ${nameSuffix}`,
      turn: 'end',
      allowIncapacitated: true,
      saveAbility,
      saveDC,
      saveDamage: 'nodamage',
      saveCount: '1-',
      saveMagic: true,
      rollMode: 'publicroll',
      actionSave,
    });
    effectData.changes.push(overTimeChange);
  }
  return effectData;
};
