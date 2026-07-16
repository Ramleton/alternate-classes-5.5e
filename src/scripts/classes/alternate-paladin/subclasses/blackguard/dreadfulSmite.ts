import { runActivity } from 'automation/utils.js';
import subclassSmiteMacroFactory, {
  DuringSmiteCallback,
} from '../utils/subclassSmiteFactory.js';

const duringCallback: DuringSmiteCallback = async ({ feat, workflow }) => {
  const target = workflow.hitTargets.first()! as Token;
  await runActivity(feat, 'save', [target]);
};

const dreadfulSmite = await subclassSmiteMacroFactory({
  name: 'Dreadful Smite',
  subclass: 'Blackguard',
  duringCallback,
});

export default dreadfulSmite;
