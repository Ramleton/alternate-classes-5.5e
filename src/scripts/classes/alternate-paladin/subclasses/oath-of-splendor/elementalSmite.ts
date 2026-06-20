import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';
import { DivineSmiteData } from '../../class-features/divineSmiteFactory.js';
import subclassSmiteMacroFactory, { DuringSmiteCallback } from '../utils/subclassSmiteFactory.js';
import { getChosenElement } from './utils.js';

interface ElementHandlerArgs {
  feat: Item<'feat'>;
  workflow: Workflow;
  target: Token;
  smiteData: DivineSmiteData;
}

type ElementHandler = (args: ElementHandlerArgs) => Promise<void>;

const handleAirElement: ElementHandler = async ({
  workflow,
  target,
  smiteData,
}) => {
  const { utils: { tokenUtils } } = chrisPremades;
  const token = workflow.token!;
  await tokenUtils.pushToken(token, target, 5 * smiteData.level);
};

const during: DuringSmiteCallback = async ({ feat, workflow }) => {
  const element = getChosenElement(feat.actor!);
  if (!element)
    return;
  const elementID = element.flags['chris-premades']?.info?.identifier;
  const smiteData = feat
    .actor!
    .flags['alternate-classes-55e']
    ?.macros
    ?.divineSmite
    ?.damage as DivineSmiteData;
  if (elementID === 'ac55eOathOfSplendorFire') {
    const { utils: { genericUtils } } = chrisPremades;
    const newSmiteFormula = smiteData.formula.replace('d8', 'd10');
    return await genericUtils.setFlag(
      feat.actor!,
      'alternate-classes-55e',
      'macros.divineSmite.damage',
      { ...smiteData, formula: newSmiteFormula },
    );
  }
  const target = workflow.hitTargets.first() as Token;
  const saveWorkflow = await runActivity(element, 'save', [target]);
  if (!saveWorkflow || elementID !== 'ac55eOathOfSplendorAir')
    return;
  for (const failedTarget of saveWorkflow.failedSaves) {
    await handleAirElement({
      feat,
      workflow,
      target: failedTarget as Token,
      smiteData,
    });
  }
};

export default await subclassSmiteMacroFactory({
  name: 'Elemental Smite',
  subclass: 'Oath of Splendor',
  priority: 50,
  duringCallback: during,
});
