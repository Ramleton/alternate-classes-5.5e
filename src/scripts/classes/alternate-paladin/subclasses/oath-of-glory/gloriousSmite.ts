import { Workflow } from '@midi-qol/types/module/Workflow.js';
import subclassSmiteMacroFactory, { DuringCallbackArgs, PreCallbackArgs, preSmiteCallback } from '../utils/subclassSmiteFactory.js';

const getTargets = (feat: Item<'feat'>, workflow: Workflow): Token[] => {
  const { utils: { tokenUtils } } = chrisPremades;
  const maxRange = (feat
    .actor!
    .system
    .scale
    ['alternate-paladin']
    ['aura-radius'] ?? 10) as number;
  return tokenUtils.findNearby(
    workflow.token!,
    maxRange,
    'ally',
    {
      includeIncapacitated: true,
      includeToken: true,
    },
  );
};

const preCallback = async (
  { feat, workflow }: PreCallbackArgs,
): Promise<boolean> => {
  const targets = getTargets(feat, workflow);
  if (!targets.length)
    return false;
  return await preSmiteCallback({ feat, workflow });
};

const during = async (
  { feat, workflow }: DuringCallbackArgs,
): Promise<void> => {
  const targets = getTargets(feat, workflow);
  const classLevels = feat
    .actor!
    .classes
    ['alternate-paladin']
    ?.system
    .levels as number;
  const chaMod = feat.actor!.system.abilities.cha.mod as number;
  const total = classLevels + chaMod;
  const { utils: { dialogUtils, workflowUtils } } = chrisPremades;
  const selection = await dialogUtils.selectTargetDialog(
    workflow.item.name,
    'Distribute Temporary Hit Points',
    targets,
    {
      type: 'selectAmount',
      maxAmount: total,
      skipDeadAndUnconscious: false,
    },
  );
  if (!selection?.length)
    return;
  const targetValues = selection[0].filter(i => i.value) as {
    document: Token;
    value: number;
  }[];
  for (const { document: target, value } of targetValues) {
    await workflowUtils.applyDamage([target], value, 'temphp');
  }
};

export default await subclassSmiteMacroFactory({
  name: 'Glorious Smite',
  subclass: 'Oath of Glory',
  macroPass: 'damageRollComplete',
  priority: 50,
  preCallback,
  duringCallback: during,
});
