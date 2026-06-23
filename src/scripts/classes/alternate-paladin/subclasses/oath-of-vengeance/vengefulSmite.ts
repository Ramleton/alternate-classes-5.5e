import { runActivity } from 'automation/utils.js';
import subclassSmiteMacroFactory, { DuringCallbackArgs } from '../utils/subclassSmiteFactory.js';

const during = async (
  { feat, workflow }: DuringCallbackArgs,
): Promise<void> => {
  const targets = Array.from(workflow.hitTargets) as Token[];
  await runActivity(feat, 'save', targets);
};

export default await subclassSmiteMacroFactory({
  name: 'Vengeful Smite',
  subclass: 'Oath of Vengeance',
  duringCallback: during,
});
