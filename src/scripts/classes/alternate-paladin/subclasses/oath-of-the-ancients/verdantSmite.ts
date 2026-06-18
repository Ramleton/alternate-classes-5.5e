import { generateOverTimeEffectChange } from 'automation/effectUtils.js';
import { runActivity } from 'automation/utils.js';
import { EffectData, OverTimeEffectData } from 'types/effects.js';
import subclassSmiteMacroFactory, { DuringCallbackArgs } from '../utils/subclassSmiteFactory.js';

const during = async (
  { feat, workflow }: DuringCallbackArgs,
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

export default await subclassSmiteMacroFactory({
  name: 'Verdant Smite',
  subclass: 'Oath of the Ancients',
  duringCallback: during,
});
