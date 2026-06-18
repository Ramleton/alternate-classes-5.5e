import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { MidiQOLEvent } from 'chris-premades/macroEvents.js';

export interface PreCallbackArgs {
  feat: Item<'feat'>;
  workflow: Workflow;
}

export const preSmiteCallback = async (
  { feat }: PreCallbackArgs,
): Promise<boolean> => {
  const flag = feat.actor!
    .flags['alternate-classes-55e']
    ?.macros
    ?.divineSmite
    ?.damage;
  if (!flag)
    return false;
  const { utils: { dialogUtils, itemUtils, socketUtils } } = chrisPremades;
  const divineFervor = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eDivineFervor',
  ) as Item<'feat'> | undefined;
  if (!divineFervor?.system?.uses?.value)
    return false;
  const selection = await dialogUtils.confirmUseItem(
    feat,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  return selection;
};

export interface DuringCallbackArgs {
  feat: Item<'feat'>;
  workflow: Workflow;
}

export interface SmiteMacroFactoryArgs {
  subclass: string;
  name: string;
  version?: `${number}.${number}.${number}`;
  macroPass?: MidiQOLEvent;
  priority?: number;
  preCallback?: (data: PreCallbackArgs) => Promise<boolean>;
  duringCallback: (data: DuringCallbackArgs) => Promise<void>;
}

const subclassSmiteMacroFactory = async (
  data: SmiteMacroFactoryArgs,
): Promise<CPRMacro> => {
  const {
    subclass,
    name,
    version = '1.0.0',
    macroPass = 'attackRollComplete',
    priority = 910,
    preCallback = preSmiteCallback,
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
          pass: macroPass,
          macro: workflow,
          priority,
        },
      ],
    },
  };
};

export default subclassSmiteMacroFactory;
