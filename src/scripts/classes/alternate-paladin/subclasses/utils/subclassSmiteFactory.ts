import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

export interface PreCallbackArgs {
  feat: Item<'feat'>;
  workflow: Workflow;
}

export interface DuringCallbackArgs {
  feat: Item<'feat'>;
  workflow: Workflow;
}

export interface SmiteMacroFactoryArgs {
  subclass: string;
  name: string;
  version?: `${number}.${number}.${number}`;
  preCallback: (data: PreCallbackArgs) => Promise<boolean>;
  duringCallback: (data: DuringCallbackArgs) => Promise<void>;
}

const subclassSmiteMacroFactory = async (
  data: SmiteMacroFactoryArgs,
): Promise<CPRMacro> => {
  const {
    subclass,
    name,
    version = '1.0.0',
    preCallback,
    duringCallback,
  } = data;

  const workflow: MidiMacroFunction = async (
    { trigger: { entity }, workflow },
  ) => {
    const feat = entity as Item<'feat'>;
    if (!feat.actor) return;
    const res1 = await preCallback({ feat, workflow });
    if (!res1) return;
    await duringCallback({ feat, workflow });
  };

  const label = name.replaceAll(' ', '');
  return {
    identifier: `ac55e${label}`,
    name: `${subclass}: ${name}`,
    source: 'Alternate Classes 5.5e',
    version: `${version}`,
    rules: 'modern',
    midi: {
      actor: [
        {
          pass: 'attackRollComplete',
          macro: workflow,
          priority: 910,
        },
      ],
    },
  };
};

export default subclassSmiteMacroFactory;
