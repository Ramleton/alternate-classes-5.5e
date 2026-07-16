import {
  MidiMacroEventDetails,
  MidiMacroFunction,
  MidiMacroFunctionArgs,
} from 'chris-premades/macro.js';

export interface MysticTechniqueHandler {
  pass: 'attackRollComplete' | unknown;
  name: string;
  preCheck: (data: MidiMacroFunctionArgs) => Promise<boolean>;
  handle: (data: MidiMacroFunctionArgs) => Promise<void>;
}

interface MysticTechniqueHandlerFactoryArgs {
  pass: 'attackRollComplete' | 'targetAttackRollComplete';
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
    const usableMysticTechniques = mysticTechniqueHandlers
      .filter((handler) => handler.pass === pass)
      .filter((handler) => handler.preCheck(data))
      .map((handler) => handler.handle);
    if (!usableMysticTechniques.length) return;
    const {
      utils: { dialogUtils, socketUtils },
    } = chrisPremades;
    const options: [string, string][] = usableMysticTechniques.map(
      (handler) => [handler.name, handler.name],
    );
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
      await usableMysticTechniques.find(
        (handler) => handler.name === selection,
      )!(data);
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
