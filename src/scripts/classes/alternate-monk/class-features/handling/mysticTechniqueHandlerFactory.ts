import {
  MidiMacroEventDetails,
  MidiMacroFunction,
  MidiMacroFunctionArgs,
} from 'chris-premades/macro.js';

type MysticTechniqueMacroPass =
  'attackRollComplete' | 'targetAttackRollComplete';

export interface MysticTechniqueHandler {
  pass: MysticTechniqueMacroPass;
  name: string;
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
        handler,
        canUse: await handler.preCheck(data),
      })),
    );

    const usableHandlers = preCheckResults
      .filter(({ canUse }) => canUse)
      .map(({ handler }) => handler);

    if (!usableHandlers.length) return;
    const {
      utils: { dialogUtils, socketUtils },
    } = chrisPremades;
    const options: [string, string][] = usableHandlers.map((handler) => [
      handler.name,
      handler.name,
    ]);
    const passName = pass
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s: string) => s.toUpperCase());
    const selection = await dialogUtils.buttonDialog(
      'Mystic Techniques',
      passName,
      options,
      {
        userId: socketUtils.firstOwner(data.workflow.actor, true),
      },
    );
    if (!selection) return;
    try {
      await usableHandlers
        .find((handler) => handler.name === selection)!
        .handle(data);
    } catch (_: unknown) {
      const {
        utils: { genericUtils },
      } = chrisPremades;
      genericUtils.notify(
        `Mystic Techniques: Could not find handler for ${selection}`,
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
