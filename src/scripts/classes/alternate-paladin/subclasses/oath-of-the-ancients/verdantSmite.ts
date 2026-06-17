import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { generateOverTimeEffectChange } from 'automation/effectUtils.js';
import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData, OverTimeEffectData } from '../../../../../types/effects.js';

const pre = async (feat: Item<'feat'>): Promise<boolean> => {
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

const during = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<void> => {
  const targets = Array.from(workflow.hitTargets) as Token[];
  const saveWorkflow = await runActivity(feat, 'save', targets);
  if (!saveWorkflow)
    return;
  const overTimeEffectData: OverTimeEffectData = {
    label: 'Verdant Smite: Restrained',
    turn: 'start',
    saveAbility: 'str',
    rollType: 'check',
    saveDC: saveWorkflow.saveDC,
    saveCount: '1-',
    actionSave: 'roll',
  };
  const overTimeChange = generateOverTimeEffectChange(
    'verdantSmiteRestrained',
    overTimeEffectData,
  );
  const effectData: EffectData = {
    name: 'Verdant Smite: Restrained',
    icon: feat.img!,
    duration: { seconds: 60 },
    origin: feat.uuid!,
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eVerdantSmiteEffect',
        },
      },
    },
    changes: [overTimeChange],
    statuses: ['restrained'],
  };
  const { utils: { effectUtils } } = chrisPremades;
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor)
      continue;
    await effectUtils.createEffect(target.actor, effectData);
  }
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor)
    return;
  const res1 = await pre(feat);
  if (!res1)
    return;
  await during(feat, workflow);
};

const macro: CPRMacro = {
  identifier: 'ac55eVerdantSmite',
  name: 'Oath of the Ancients: Verdant Smite',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
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

export default macro;
