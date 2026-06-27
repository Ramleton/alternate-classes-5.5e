type SpellLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type SpellType = 'ac55eSpell';

export type CombinedKeys = `${SpellType}${SpellLevel}`;

interface SpellLevelData<L extends SpellLevel, T extends SpellType> {
  label: string;
  level: L;
  max: number;
  type: T;
  value: number;
}

export type DynamicSpells = {
  [
    K in CombinedKeys
  ]: K extends `${infer T extends SpellType}${infer L extends SpellLevel}`
    ? SpellLevelData<L, T>
    : never;
};

type SpellData = DynamicSpells & {
  hasSpellSlots: boolean;
};

export const getSpellData = (actor: Actor5e): SpellData => {
  const data: { [key in CombinedKeys]?: DynamicSpells[key] } = {};
  const spellDetails = actor.system.spells;
  const levels: SpellLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  levels.forEach((lvl) => {
    const systemSpellKey = `spell${lvl}` as keyof typeof spellDetails;
    const systemSpell = spellDetails[systemSpellKey];

    const customKey: CombinedKeys = `ac55eSpell${lvl}`;

    data[customKey] = {
      label: game.i18n!.localize(`DND5E.SpellLevel${lvl}`),
      level: lvl,
      max: systemSpell?.max ?? 0,
      type: 'ac55eSpell',
      value: systemSpell?.value ?? 0,
    };
  });
  const totalSlots = Object.values(spellDetails).reduce(
    (slots: number, sData: { value: number; max: number }) => {
      return slots + (sData?.value ?? 0);
    },
    0,
  );
  return {
    ...(data as DynamicSpells),
    hasSpellSlots: totalSlots > 0,
  };
};

export const isSpellObject = (
  item: unknown,
): item is DynamicSpells[CombinedKeys] => {
  return typeof item === 'object' && item !== null && 'level' in item;
};

export const spendSpellSlot = async (
  actor: Actor5e,
  spell: SpellType,
  level: SpellLevel,
) => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  switch (spell) {
    case 'ac55eSpell':
      await genericUtils.update(actor, {
        ['system.spells.spell' + level + '.value']:
          actor.system.spells['spell' + level].value - 1,
      });
  }
};

export const spendLowestLevelSpellSlot = async (
  actor: Actor5e,
): Promise<SpellLevel | null> => {
  const spellData = getSpellData(actor);

  if (!spellData.hasSpellSlots) {
    return null;
  }

  const levels: SpellLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const level of levels) {
    const key: CombinedKeys = `ac55eSpell${level}`;
    const slotData = spellData[key];

    if (slotData && slotData.value > 0) {
      await spendSpellSlot(actor, 'ac55eSpell', level);
      return level;
    }
  }

  // Fallback in case state didn't match hasSpellSlots
  return null;
};
