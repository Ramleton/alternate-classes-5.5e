import {
  MidiMacroEventDetails,
  MidiMacroFunction,
  MidiMacroFunctionArgs,
} from 'chris-premades/macro.js';

type MysticTechniqueMacroPass =
  | 'attackRollComplete'
  | 'targetAttackRollComplete'
  | 'targetDamageRollComplete';

export type MysticTechniquePreCheck = (
  data: MidiMacroFunctionArgs & { technique: Item<'feat'> },
) => Promise<boolean>;

export type MysticTechniqueHandler = (
  data: MidiMacroFunctionArgs & { technique: Item<'feat'> },
) => Promise<void>;

export interface MysticTechniqueData {
  pass: MysticTechniqueMacroPass;
  cprIdentifier: string;
  name?: string;
  preCheck: MysticTechniquePreCheck;
  handle: MysticTechniqueHandler;
}

interface MysticTechniqueHandlerFactoryArgs {
  pass: MysticTechniqueMacroPass;
  priority?: number;
}

type MysticTechniqueHandlerFactory = (
  args: MysticTechniqueHandlerFactoryArgs,
) => MidiMacroEventDetails;

const mysticTechniqueHandlers: MysticTechniqueData[] = [];

export const addMysticTechniqueHandler = (handler: MysticTechniqueData) => {
  mysticTechniqueHandlers.push(handler);
};

const deriveNameFromIdentifier = (identifier: string): string => {
  return identifier
    .replace(/^ac55e/, '')
    .replace(/MysticTechnique$/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

const handlerFactory: MysticTechniqueHandlerFactory = ({
  pass,
  priority = 0,
}) => {
  const macro: MidiMacroFunction = async (data) => {
    const {
      utils: { dialogUtils, itemUtils, socketUtils },
    } = chrisPremades;

    const feat = data.trigger.entity as Item<'feat'>;
    const actor = feat.actor!;

    const candidates = mysticTechniqueHandlers
      .filter((handler) => handler.pass === pass)
      .map((handler) => ({
        handler,
        technique: itemUtils.getItemByIdentifier(
          actor,
          handler.cprIdentifier,
        ) as Item<'feat'> | null,
      }))
      .filter(
        (
          entry,
        ): entry is { handler: MysticTechniqueData; technique: Item<'feat'> } =>
          Boolean(entry.technique),
      );

    if (!candidates.length) return;

    const preCheckResults = await Promise.all(
      candidates.map(async (entry) => ({
        ...entry,
        canUse: await entry.handler.preCheck({
          ...data,
          technique: entry.technique,
        }),
      })),
    );

    const usable = preCheckResults.filter(({ canUse }) => canUse);

    if (!usable.length) return;
    const options: [string, string][] = usable.map(({ handler }) => [
      handler.name ?? deriveNameFromIdentifier(handler.cprIdentifier),
      handler.cprIdentifier,
    ]);
    const passName = pass
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s: string) => s.toUpperCase());
    const selectedID = await dialogUtils.buttonDialog(
      'Mystic Techniques',
      passName,
      options,
      {
        userId: socketUtils.firstOwner(data.workflow.actor, true),
      },
    );
    if (!selectedID) return;

    const target = usable.find(
      ({ handler }) => handler.cprIdentifier === selectedID,
    );
    if (!target) return;

    try {
      await target.handler.handle({
        ...data,
        technique: target.technique,
      });
    } catch (_: unknown) {
      const {
        utils: { genericUtils },
      } = chrisPremades;
      genericUtils.notify(
        `Mystic Techniques: Could not find handler for ${selectedID}`,
        'error',
      );
    }
  };
  return {
    pass,
    macro,
    priority,
  };
};

export default handlerFactory;
