import {
  MidiMacroEventDetails,
  MidiMacroFunction,
  MidiMacroFunctionArgs,
} from 'chris-premades/macro.js';

type MysticTechniqueMacroPass =
  'attackRollComplete' | 'targetAttackRollComplete';

export interface MysticTechniqueHandler {
  pass: MysticTechniqueMacroPass;
  cprIdentifier: string;
  name?: string;
  preCheck: (data: MidiMacroFunctionArgs) => Promise<boolean>;
  handle: (data: MidiMacroFunctionArgs) => Promise<void>;
}

interface MysticTechniqueHandlerFactoryArgs {
  pass: MysticTechniqueMacroPass;
  priority?: number;
}

type MysticTechniqueHandlerFactory = (
  args: MysticTechniqueHandlerFactoryArgs,
) => MidiMacroEventDetails;

const mysticTechniqueHandlers: MysticTechniqueHandler[] = [];

export const addMysticTechniqueHandler = (handler: MysticTechniqueHandler) => {
  mysticTechniqueHandlers.push(handler);
};

const deriveNameFromIdentifier = (identifier: string): string => {
  return identifier
    .replace(/^ac55e/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

const handlerFactory: MysticTechniqueHandlerFactory = ({
  pass,
  priority = 0,
}) => {
  const macro: MidiMacroFunction = async (data) => {
    const potentialHandlers = mysticTechniqueHandlers.filter(
      (handler) => handler.pass === pass,
    );

    const preCheckResults = await Promise.all(
      potentialHandlers.map(async (handler) => ({
        cprIdentifier: handler.cprIdentifier,
        handler,
        canUse: await handler.preCheck(data),
      })),
    );
    const {
      utils: { dialogUtils, itemUtils, socketUtils },
    } = chrisPremades;

    const feat = data.trigger.entity as Item<'feat'>;
    const actor = feat.actor!;

    const usableHandlers = preCheckResults
      .filter(({ canUse }) => canUse)
      .filter(({ cprIdentifier }) =>
        itemUtils.getItemByIdentifier(actor, cprIdentifier),
      )
      .map(({ handler }) => handler);

    if (!usableHandlers.length) return;
    const options: [string, string][] = usableHandlers.map((handler) => [
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
    try {
      await usableHandlers
        .find((handler) => handler.cprIdentifier === selectedID)!
        .handle(data);
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
