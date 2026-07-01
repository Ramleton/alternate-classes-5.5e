export type SpellLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SpellType = 'ac55eSpell';

export type CombinedKeys = `${SpellType}${SpellLevel}`;

const MODULE_ID = 'alternate-classes-55e' as const;
const RECOVERY_TEMPLATE_PATH = `modules/${MODULE_ID}/assets/templates/spellRecovery.hbs`;

interface SlotState {
  level: SpellLevel;
  label: string;
  current: number;
  max: number;
  recovering: number;
}

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

export const promptSpellSlotChoice = async (
  actor: Actor5e,
): Promise<SpellLevel | null> => {
  const {
    utils: { dialogUtils, socketUtils },
  } = chrisPremades;

  const spellData = getSpellData(actor);

  if (!spellData.hasSpellSlots) return null;

  const levels: SpellLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const availableLevels = levels.filter((level) => {
    const slotData = spellData[`ac55eSpell${level}` as CombinedKeys];
    return slotData && slotData.value > 0;
  });

  if (availableLevels.length === 0) return null;

  const buttons = availableLevels.map((level) => {
    const slotData = spellData[`ac55eSpell${level}` as CombinedKeys];
    return [slotData.label + ` (${slotData.value}/${slotData.max})`, level] as [
      string,
      SpellLevel,
    ];
  });

  const chosenLevel = (await dialogUtils.buttonDialog(
    'Spend Spell Slot',
    'Choose a spell slot level to spend:',
    buttons,
    { userId: socketUtils.firstOwner(actor, true) },
  )) as SpellLevel | null;

  if (!chosenLevel) return null;

  await spendSpellSlot(actor, 'ac55eSpell', chosenLevel);
  return chosenLevel;
};

export const getSlotStates = (actor: Actor5e): SlotState[] => {
  const levels: SpellLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return levels
    .map((level) => {
      const systemSpell =
        actor.system.spells[
          `spell${level}` as keyof typeof actor.system.spells
        ];
      return {
        level,
        label: game.i18n!.localize(`DND5E.SpellLevel${level}`),
        current: systemSpell?.value ?? 0,
        max: systemSpell?.max ?? 0,
        recovering: 0,
      };
    })
    .filter((s) => s.max > 0 && s.current < s.max);
};

const buildRecoveryDialogContent = async (
  slots: SlotState[],
  budget: number,
): Promise<string> => {
  return renderTemplate(RECOVERY_TEMPLATE_PATH, {
    slots,
    budget,
    pips: Array.from({ length: budget }),
  });
};

const attachRecoveryDialogListeners = (
  html: HTMLElement,
  slots: SlotState[],
  budget: number,
  onUpdate: (slots: SlotState[], spent: number) => void,
) => {
  const getSpent = () =>
    slots.reduce((sum, s) => sum + s.recovering * s.level, 0);

  const refresh = () => {
    const spent = getSpent();
    const remaining = budget - spent;

    const budgetEl = html.querySelector<HTMLElement>('#nr-budget-remaining');
    if (budgetEl) {
      budgetEl.textContent = String(remaining);
      budgetEl.style.color =
        remaining < 0
          ? 'var(--color-level-error)'
          : 'var(--color-text-dark-primary)';
    }

    const pips = html.querySelectorAll<HTMLElement>('.budget-pip');
    pips.forEach((pip, i) => {
      pip.classList.toggle('used', i < spent && spent <= budget);
      pip.classList.toggle('over', spent > budget);
    });

    for (const slot of slots) {
      const recoverEl = html.querySelector<HTMLElement>(
        `#recovering-${slot.level}`,
      );
      const currentEl = html.querySelector<HTMLElement>(
        `[data-level="${slot.level}"] .current-val`,
      );
      const decBtn = html.querySelector<HTMLButtonElement>(
        `[data-level="${slot.level}"].slot-decrement`,
      );
      const incBtn = html.querySelector<HTMLButtonElement>(
        `[data-level="${slot.level}"].slot-increment`,
      );

      if (recoverEl) recoverEl.textContent = String(slot.recovering);
      if (currentEl)
        currentEl.textContent = String(slot.current + slot.recovering);
      if (decBtn) decBtn.disabled = slot.recovering === 0;
      if (incBtn)
        incBtn.disabled =
          slot.current + slot.recovering >= slot.max || remaining < slot.level;
    }

    onUpdate(slots, spent);
  };

  html.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const levelStr = target.dataset.level;
    if (!levelStr) return;

    const level = Number(levelStr) as SpellLevel;
    const slot = slots.find((s) => s.level === level);
    if (!slot) return;

    const spent = getSpent();
    const remaining = budget - spent;

    if (target.classList.contains('slot-increment')) {
      if (
        slot.current + slot.recovering < slot.max &&
        remaining >= slot.level
      ) {
        slot.recovering++;
      }
    } else if (target.classList.contains('slot-decrement')) {
      if (slot.recovering > 0) slot.recovering--;
    }

    refresh();
  });

  refresh();
};

/**
 * Prompts the user to choose which spell slots to recover up to a combined
 * level budget. Returns the chosen slots, or null if cancelled or nothing selected.
 */
export const promptSpellSlotRecovery = async (
  actor: Actor5e,
  budget: number,
): Promise<SlotState[] | null> => {
  const {
    utils: { genericUtils },
  } = chrisPremades;

  const slots = getSlotStates(actor);

  if (slots.length === 0) {
    genericUtils.notify('You have no expended spell slots to recover.', 'warn');
    return null;
  }

  let currentSlots: SlotState[] = slots;
  let currentSpent = 0;

  const result = (await foundry.applications.api.DialogV2.wait({
    window: { title: 'Recover Spell Slots' },
    content: await buildRecoveryDialogContent(slots, budget),
    buttons: [
      {
        action: 'confirm',
        label: 'Recover Slots',
        default: true,
        callback: () => true,
      },
      {
        action: 'cancel',
        label: 'Cancel',
        callback: () => false,
      },
    ],
    render: (_event: Event, application: foundry.applications.api.DialogV2) => {
      const el = application.element;
      attachRecoveryDialogListeners(el, slots, budget, (updated, spent) => {
        currentSlots = updated;
        currentSpent = spent;
        const confirmBtn = el.querySelector<HTMLButtonElement>(
          '[data-action="confirm"]',
        );
        if (confirmBtn) {
          confirmBtn.disabled = currentSpent === 0 || currentSpent > budget;
        }
      });
    },
    rejectClose: false,
  })) as boolean | null;

  if (!result) return null;

  const slotsToRecover = currentSlots.filter((s) => s.recovering > 0);
  return slotsToRecover.length > 0 ? slotsToRecover : null;
};

/**
 * Applies spell slot recovery updates to the actor based on chosen slots.
 */
export const applySpellSlotRecovery = async (
  actor: Actor5e,
  slotsToRecover: SlotState[],
): Promise<void> => {
  const {
    utils: { genericUtils },
  } = chrisPremades;

  const updates: Record<string, number> = {};
  for (const slot of slotsToRecover) {
    updates[`system.spells.spell${slot.level}.value`] =
      slot.current + slot.recovering;
  }
  await genericUtils.update(actor, updates);
};

export const formatRecoveredSummary = (slotsToRecover: SlotState[]): string =>
  slotsToRecover.map((s) => `${s.recovering} x ${s.label}`).join(', ');
