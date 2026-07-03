import {
  getWorkflowProperty,
  setWorkflowProperty,
} from 'automation/workflowUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import {
  getSneakAttack,
  qualifiesForSneakAttack,
} from '../utils/sneakAttackUtils.js';

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  const useSneakAttack = getWorkflowProperty(workflow, 'sneakAttack');
  if (useSneakAttack) return;
  if (!qualifiesForSneakAttack(feat, token, workflow)) return;
  const {
    utils: { socketUtils },
  } = chrisPremades;
  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await chrisPremades.utils.dialogUtils.confirmUseItem(feat, {
    userId,
  });
  if (!selection) return;
  setWorkflowProperty(workflow, 'sneakAttack', 1);
};

const damageBonus: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const useSneakAttack = getWorkflowProperty(workflow, 'sneakAttack');
  if (!useSneakAttack) return;
  const sneakAttackReduction =
    (getWorkflowProperty(workflow, 'sneakAttackReduction') as number) ?? 0;
  const sneakAttack = getSneakAttack(feat.actor!);
  const sneakAttackDice = sneakAttack.number! - sneakAttackReduction;
  const formula = `${sneakAttackDice}${sneakAttack.die}`;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  await workflowUtils.bonusDamage(workflow, formula);
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses!.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eSneakAttack',
  name: 'Sneak Attack',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: prompt,
        priority: 8,
      },
      {
        pass: 'damageRollComplete',
        macro: damageBonus,
        priority: 100,
      },
    ],
  },
};

export default macro;
