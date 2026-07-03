import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { applySourceTargetInterdependentEffects } from 'automation/effectUtils.js';
import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { CheckActivity } from 'fvtt-types/Activity.js';
import { isCharacterActor, isNPCActor } from 'types/actors.js';
import { EffectChange } from 'types/effects.js';

const use: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.targets.size) return;
  const target = workflow.targets.first()! as Token;
  const feat = entity as Item<'feat'>;
  const searchActivityData = (await getActivityData(
    feat,
    'search',
  )) as CheckActivity;
  const targetActor = target.actor!;
  let targetCR = 0;
  if (isCharacterActor(targetActor)) {
    targetCR = targetActor.system.details.level;
  } else if (isNPCActor(targetActor)) {
    targetCR = targetActor.system.details.cr;
  }
  const checkDC = 8 + targetCR;
  searchActivityData.check.dc.value = '' + checkDC;
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const checkWorkflow: Workflow = await workflowUtils.syntheticActivityDataRoll(
    searchActivityData,
    feat,
    feat.actor!,
    [target],
  );
  if (!checkWorkflow.saves.size) return;
  const targetChanges: EffectChange[] = [
    {
      key: 'flags.automated-conditions-5e.grants.attack.bonus',
      mode: 0,
      value: `bonus=${Math.max(1, feat.actor!.system.abilities.int.mod)}; (mwak || rwak) && tokenId === effectOriginTokenId;`,
      priority: 20,
    },
  ];
  await applySourceTargetInterdependentEffects({
    feat,
    target,
    targetChanges,
    duration: { seconds: 60 },
  });
};

const macro: CPRMacro = {
  identifier: 'ac55ePredictiveFighting',
  name: 'Investigator: Predictive Fighting',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: use,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
