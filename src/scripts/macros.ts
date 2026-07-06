import CPRMacro, {
  MidiMacroEventDetails,
  MidiMacroFunctionArgs,
} from '../types/chris-premades/macro.js';
import classMacros from './classes/macros.js';
import exploitMacros from './exploits/macros.js';

const MIDI_EVENTS = ['actor', 'item'] as const;

const injectAC55ePropertiesInWorkflow = (macros: CPRMacro[]): CPRMacro[] => {
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

const macros: CPRMacro[] = injectAC55ePropertiesInWorkflow([
  ...classMacros,
  ...exploitMacros,
]);

export default macros;
