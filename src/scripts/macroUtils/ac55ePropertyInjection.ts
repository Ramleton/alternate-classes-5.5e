import CPRMacro, {
  MidiMacroEventDetails,
  MidiMacroFunctionArgs,
} from 'chris-premades/macro.js';
import { MIDI_EVENTS } from './constants.js';

export const injectAC55ePropertiesInWorkflow = (
  macros: CPRMacro[],
): CPRMacro[] => {
  return macros.map((macro) => {
    const clonedMacro = { ...macro };
    if (!clonedMacro.midi) return macro;
    for (const key of MIDI_EVENTS) {
      if (clonedMacro.midi[key]) {
        clonedMacro.midi[key] = clonedMacro.midi[key].map(
          (eventDetails: MidiMacroEventDetails) => {
            const originalFunction = eventDetails.macro;
            eventDetails.macro = async (data: MidiMacroFunctionArgs) => {
              if (!data.workflow['alternate-classes-55e'])
                data.workflow['alternate-classes-55e'] = {};
              return await originalFunction(data);
            };
            return eventDetails;
          },
        );
      }
    }
    return clonedMacro;
  });
};
