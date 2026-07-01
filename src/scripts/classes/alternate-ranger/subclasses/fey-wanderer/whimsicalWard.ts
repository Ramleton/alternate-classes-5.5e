import { getActivityData } from 'automation/utils.js';
import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';
import { SaveActivity } from 'fvtt-types/Activity.js';

const FEY_WANDERER_SPELLS = [
  'Dissonant Whispers',
  'Charm Person',
  'Misty Step',
  'Suggestion',
  'Summon Fey',
  'Fear',
  'Charm Monster',
  'Dimension Door',
  'Geas',
  'Mislead',
] as const;

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!feat.system.uses?.value) return;
  if (!workflow.saves.size) return;
  if (!FEY_WANDERER_SPELLS.includes(workflow.item.name)) return;
  const {
    utils: {
      dialogUtils,
      genericUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const usedSpells =
    feat.flags['alternate-classes-55e']?.macros?.whimsicalWard ?? [];
  if (usedSpells.includes(workflow.item.identifier)) return;
  const range = workflow.activity.target?.template?.size
    ? workflow.activity.target.template.size
    : workflow.activity.range.value;
  const nearbyTokens = new Set(
    tokenUtils.findNearby(token, range, 'any', {
      includeIncapacitated: true,
      includeToken: false,
    }),
  );
  const newTargets = nearbyTokens.difference(workflow.targets);
  const userId = socketUtils.firstOwner(feat.actor, true);
  if (!newTargets.size) return;
  const useFeature = await dialogUtils.confirmUseItem(feat, {
    userId,
  });
  if (!useFeature) return;
  let selectedTarget: Token | undefined;
  if (newTargets.size === 1) {
    selectedTarget = Array.from(newTargets)[0];
  } else {
    const selection = await dialogUtils.selectTargetDialog(
      feat.name,
      "A creature succeeded on your spell's save. Pick a new target.",
      Array.from(newTargets),
      {
        skipDeadAndUnconscious: false,
        userId,
      },
    );
    if (!selection) return;
    selectedTarget = selection[0];
  }
  const saveActivityData = (await getActivityData(
    feat,
    'save',
  )) as SaveActivity;
  saveActivityData.save.ability = workflow.activity.save.ability;
  const saveWorkflow = await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    feat,
    feat.actor,
    [selectedTarget!],
    { consumeResources: true },
  );
  if (!saveWorkflow) return;
  workflow.failedSaves = new Set([
    ...workflow.failedSaves,
    ...saveWorkflow.failedSaves,
  ]);
  workflow.fumbleSaves = new Set([
    ...workflow.fumbleSaves,
    ...saveWorkflow.fumbleSaves,
  ]);
  workflow.saves = new Set([...workflow.saves, ...saveWorkflow.saves]);
  workflow.criticalSaves = new Set([
    ...workflow.criticalSaves,
    ...saveWorkflow.criticalSaves,
  ]);
  workflow.hitTargets = new Set([
    ...workflow.hitTargets,
    ...saveWorkflow.hitTargets,
  ]);
  workflow.targets = new Set([...workflow.targets, ...saveWorkflow.targets]);
  await genericUtils.setFlag(
    feat,
    'alternate-classes-55e',
    'macros.whimsicalWard',
    [...usedSpells, workflow.item.identifier],
  );
};

const reset: MacroFunction = async ({ trigger: { entity } }) => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.unsetFlag(
    entity,
    'alternate-classes-55e',
    'macros.whimsicalWard',
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eWhimsicalWard',
  name: 'Fey Wanderer: Whimsical Ward',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'savesComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
  rest: [
    {
      pass: 'long',
      macro: reset,
      priority: 100,
    },
  ],
};

export default macro;
