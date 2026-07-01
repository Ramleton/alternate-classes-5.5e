import { SpellLevel } from 'automation/spellUtils.js';
import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';

const MODULE_ID = 'alternate-classes-55e';
const TEMPLATE_PATH = `modules/${MODULE_ID}/assets/templates/naturalRecovery.hbs`;

interface SlotState {
  level: SpellLevel;
  label: string;
  current: number;
  max: number;
  recovering: number;
}

const getSlotStates = (actor: Actor5e): SlotState[] => {
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

const buildDialogContent = async (
  slots: SlotState[],
  budget: number,
): Promise<string> => {
  return foundry.applications.handlebars.renderTemplate(TEMPLATE_PATH, {
    slots,
    budget,
    pips: Array.from({ length: budget }),
  });
};

const attachDialogListeners = (
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

const prompt: MacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!feat.system.uses?.value) return;

  const {
    utils: { dialogUtils, genericUtils, socketUtils },
  } = chrisPremades;

  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;

  const wisMod = feat.actor.system.abilities.wis.mod;
  const budget = Math.max(1, wisMod);
  const slots = getSlotStates(feat.actor);

  if (slots.length === 0) {
    genericUtils.notify('You have no expended spell slots to recover.', 'warn');
    return;
  }

  let currentSlots: SlotState[] = slots;
  let currentSpent = 0;

  const result = (await foundry.applications.api.DialogV2.wait({
    window: { title: 'Natural Recovery — Choose Slots to Recover' },
    content: await buildDialogContent(slots, budget),
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
      attachDialogListeners(el, slots, budget, (updated, spent) => {
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

  if (!result) return;

  const slotsToRecover = currentSlots.filter((s) => s.recovering > 0);
  if (slotsToRecover.length === 0) return;

  const updates: Record<string, number> = {};
  for (const slot of slotsToRecover) {
    updates[`system.spells.spell${slot.level}.value`] =
      slot.current + slot.recovering;
  }

  await genericUtils.update(feat.actor, updates);
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });

  const recoveredSummary = slotsToRecover
    .map((s) => `${s.recovering} x ${s.label}`)
    .join(', ');

  await dialogUtils.buttonDialog(
    'Natural Recovery',
    `You recovered: ${recoveredSummary}. You must complete a long rest before using this feature again.`,
    [['OK', false]],
    { userId },
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eNaturalRegeneration',
  name: 'Natural Regeneration',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  rest: [
    {
      pass: 'short',
      macro: prompt,
      priority: 100,
    },
  ],
};

export default macro;
