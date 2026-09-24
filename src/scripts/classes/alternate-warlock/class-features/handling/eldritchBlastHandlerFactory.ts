import {
  MidiMacroEventDetails,
  MidiMacroFunction,
  MidiMacroFunctionArgs,
} from 'chris-premades/macro.js';

type EldritchBlastMacroPass =
  | 'postAttackRoll'
  | 'attackRollComplete'
  | 'targetAttackRollComplete'
  | 'damageRollComplete'
  | 'targetDamageRollComplete'
  | 'applyDamage';

export type EldritchBlastPreCheck = (
  data: MidiMacroFunctionArgs & { feature: Item<'feat'> },
) => Promise<boolean>;

export type EldritchBlastHandler = (
  data: MidiMacroFunctionArgs & { feature: Item<'feat'> },
) => Promise<void>;

export interface EldritchBlastData {
  pass: EldritchBlastMacroPass;
  cprIdentifier: string;
  name?: string;
  exclusive: boolean;
  automatic?: boolean;
  preCheck: EldritchBlastPreCheck;
  handle: EldritchBlastHandler;
}

interface EldritchBlastHandlerFactoryArgs {
  pass: EldritchBlastMacroPass;
  priority?: number;
}

type EldritchBlastHandlerFactory = (
  args: EldritchBlastHandlerFactoryArgs,
) => MidiMacroEventDetails;

const eldritchBlastHandlers: EldritchBlastData[] = [];

export const addEldritchBlastHandler = (handler: EldritchBlastData) => {
  eldritchBlastHandlers.push(handler);
};

const deriveNameFromIdentifier = (identifier: string): string => {
  return identifier
    .replace(/^ac55e/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

/**
 * Custom Multi-Select Checkbox Dialog using modern Foundry VTT v12+ DialogV2 API
 */
const promptCheckboxDialog = async (
  title: string,
  contentHtml: string,
  options: [label: string, value: string][],
): Promise<string[]> => {
  const checkboxesHtml = options
    .map(
      ([label, value], idx) => `
      <div class="form-group" style="margin-bottom: 6px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" name="ebFeature" value="${value}" id="eb-cb-${idx}" />
          <span>${label}</span>
        </label>
      </div>
    `,
    )
    .join('');

  const fullContent = `
    <form style="display: flex; flex-direction: column; gap: 8px;">
      ${contentHtml}
      <div style="max-height: 240px; overflow-y: auto; border: 1px solid var(--color-border-dark); padding: 8px; border-radius: 4px; background: rgba(0,0,0,0.1);">
        ${checkboxesHtml}
      </div>
    </form>
  `;

  try {
    // Access DialogV2 via dynamic cast to bypass missing ambient types
    const DialogV2Class = (
      foundry as unknown as {
        applications: {
          api: {
            DialogV2: {
              prompt: (config: Record<string, unknown>) => Promise<unknown>;
            };
          };
        };
      }
    ).applications.api.DialogV2;

    const result = await DialogV2Class.prompt({
      window: { title },
      content: fullContent,
      ok: {
        label: 'Apply Selected',
        callback: (_event: Event, button: HTMLButtonElement) => {
          const form = button.form;
          if (!form) return [];
          const checkedInputs = form.querySelectorAll<HTMLInputElement>(
            'input[name="ebFeature"]:checked',
          );
          return Array.from(checkedInputs).map((cb) => cb.value);
        },
      },
      rejectClose: false,
    });

    return (result as string[]) ?? [];
  } catch {
    return []; // Dialog closed or rejected
  }
};

const isEldritchAttack = async ({
  workflow,
}: MidiMacroFunctionArgs): Promise<boolean> => {
  const {
    utils: { constants, itemUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.attacks.some((attackType) => actionType === attackType))
    return false;
  if (
    workflow.item.flags['chris-premades']?.info?.identifier ===
    'ac55eEldritchBlast'
  )
    return true;
  const enspelledBlade = itemUtils.getItemByIdentifier(
    workflow.actor!,
    'ac55eEnspelledBlade',
  );
  const eldritchBladeEnchant = itemUtils.getEffectByIdentifier(
    workflow.item,
    'ac55eEldritchBladeEnchantment',
  );
  if (enspelledBlade && eldritchBladeEnchant) return true;
  return false;
};

const handlerFactory: EldritchBlastHandlerFactory = ({
  pass,
  priority = 0,
}) => {
  const macro: MidiMacroFunction = async (data) => {
    const {
      utils: { genericUtils, itemUtils },
    } = chrisPremades;

    const feat = data.trigger.entity as Item<'feat'>;
    const actor = feat.actor;
    if (!actor) return;

    // Ensure state container exists on workflow
    data.workflow['alternate-classes-55e'] ??= {};

    const hasUsedExclusive = () =>
      Boolean(
        data.workflow['alternate-classes-55e']
          .exclusiveEldritchBlastFeatureUsed,
      );

    const candidates = eldritchBlastHandlers
      .filter((handler) => handler.pass === pass)
      .filter((handler) => !hasUsedExclusive() || !handler.exclusive)
      .map((handler) => ({
        handler,
        feature: itemUtils.getItemByIdentifier(
          actor,
          handler.cprIdentifier,
        ) as Item<'feat'> | null,
      }))
      .filter(
        (
          entry,
        ): entry is {
          handler: EldritchBlastData;
          feature: Item<'feat'>;
        } => Boolean(entry.feature),
      );

    if (!candidates.length) return;

    const preCheckResults = await Promise.all(
      candidates.map(async (entry) => ({
        ...entry,
        canUse:
          (await isEldritchAttack(data)) &&
          (await entry.handler.preCheck({
            ...data,
            feature: entry.feature,
          })),
      })),
    );

    const usable = preCheckResults.filter(({ canUse }) => canUse);
    if (!usable.length) return;

    // 1. Run Automatic Handlers
    const autoHandlers = usable.filter(({ handler }) => handler.automatic);

    for (const entry of autoHandlers) {
      if (entry.handler.exclusive && hasUsedExclusive()) {
        continue;
      }

      try {
        await entry.handler.handle({
          ...data,
          feature: entry.feature,
        });

        if (entry.handler.exclusive) {
          data.workflow[
            'alternate-classes-55e'
          ].exclusiveEldritchBlastFeatureUsed = true;
        }
      } catch (err) {
        console.error(
          `Alternate Classes 5.5e | Error executing automatic feature (${entry.handler.cprIdentifier}):`,
          err,
        );
      }
    }

    // 2. Filter for Manual Handlers
    // Exclude automatic handlers & re-verify exclusive status in case an auto feature used it
    const manualHandlers = usable.filter(
      ({ handler }) =>
        !handler.automatic && (!hasUsedExclusive() || !handler.exclusive),
    );

    if (!manualHandlers.length) return;

    const dialogOptions: [string, string][] = manualHandlers.map(
      ({ handler }) => [
        handler.name ?? deriveNameFromIdentifier(handler.cprIdentifier),
        handler.cprIdentifier,
      ],
    );

    const passName = pass
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s: string) => s.toUpperCase());

    // Prompt user with checkbox multi-select dialog for manual choices
    const selectedIDs = await promptCheckboxDialog(
      'Eldritch Blast Features',
      `<p><strong>${passName}:</strong> Select the features to apply:</p>`,
      dialogOptions,
    );
    if (!selectedIDs.length) return;

    // 3. Sequentially process manual selections
    for (const selectedID of selectedIDs) {
      const target = manualHandlers.find(
        ({ handler }) => handler.cprIdentifier === selectedID,
      );
      if (!target) continue;

      if (target.handler.exclusive && hasUsedExclusive()) {
        genericUtils.notify(
          `Skipped ${
            target.handler.name ?? selectedID
          }: An exclusive feature was already applied.`,
          'info',
        );
        continue;
      }

      try {
        await target.handler.handle({
          ...data,
          feature: target.feature,
        });

        if (target.handler.exclusive) {
          data.workflow[
            'alternate-classes-55e'
          ].exclusiveEldritchBlastFeatureUsed = true;
        }
      } catch (err) {
        console.error(
          `Alternate Classes 5.5e | Error executing feature (${selectedID}):`,
          err,
        );
        genericUtils.notify(
          `Eldritch Blast: Error executing handler for ${selectedID}`,
          'error',
        );
      }
    }
  };

  return {
    pass,
    macro,
    priority,
  };
};

export default handlerFactory;
