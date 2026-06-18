import { runActivity } from 'automation/utils.js';
import { EffectData, Status } from 'types/effects.js';
import subclassSmiteMacroFactory, { DuringCallbackArgs } from '../utils/subclassSmiteFactory.js';

type StatusOption = (['Command', 'command'] | [string, Status]);

const during = async (
  { feat, workflow }: DuringCallbackArgs,
): Promise<void> => {
  const targets = Array.from(workflow.hitTargets) as Token[];
  const saveWorkflow = await runActivity(feat, 'save', targets);
  if (!saveWorkflow)
    return;
  const options: StatusOption[] = [
    ['Knock prone', 'prone'],
    ['Frighten', 'frightened'],
    ['Command', 'command'],
  ];
  const { utils: { dialogUtils } } = chrisPremades;
  const selection = await dialogUtils.buttonDialog(
    feat.name,
    'Choose effect to apply',
    options,
  ) ?? 'prone';
  const effectData: EffectData = {
    name: `${feat.name}: ${selection[0].toUpperCase() + selection.slice(1)}`,
    icon: feat.img!,
    duration: { rounds: 2 },
    origin: feat.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
      },
    },
    changes: [],
    statuses: selection === 'frightened' ? [selection] : [],
  };
  switch (selection) {
    case 'prone':
      effectData.duration = { seconds: 1 };
      effectData.flags.dnd5e = { riders: { statuses: ['prone'] } };
      break;
    case 'frightened':
      effectData.flags.dae = { specialDuration: ['turnEndSource'] };
    default:
      effectData.flags.dae = { specialDuration: ['turnEndTarget'] };
  }
  const { utils: { effectUtils } } = chrisPremades;
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor)
      continue;
    await effectUtils.createEffect(target.actor, effectData);
  }
};

export default await subclassSmiteMacroFactory({
  name: 'Conquering Smite',
  subclass: 'Oath of Conquest',
  duringCallback: during,
});
