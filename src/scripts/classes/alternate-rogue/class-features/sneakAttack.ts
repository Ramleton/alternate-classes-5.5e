import {
  getWorkflowProperty,
  setWorkflowProperty,
} from 'automation/workflowUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageType } from 'types/damage.js';
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
  if (!qualifiesForSneakAttack(feat, token, workflow)) return;
  const {
    utils: { socketUtils },
  } = chrisPremades;
  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await chrisPremades.utils.dialogUtils.confirmUseItem(feat, {
    userId,
  });
  if (!selection) return;
  setWorkflowProperty(workflow, feat.actor!, 'sneakAttack', 1);
};

const damageBonus: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const useSneakAttack = getWorkflowProperty(
    workflow,
    feat.actor!,
    'sneakAttack',
  );
  if (!useSneakAttack) return;
  const sneakAttackReduction =
    (getWorkflowProperty(
      workflow,
      feat.actor!,
      'sneakAttackReduction',
    ) as number) ?? 0;
  const {
    utils: { effectUtils, genericUtils, workflowUtils },
  } = chrisPremades;
  const targetActor = workflow.targets.first()!.actor!;
  const predictiveFightingTarget = effectUtils.getEffectByIdentifier(
    targetActor,
    'ac55ePredictiveFightingTarget',
  );
  const sneakAttack = getSneakAttack(feat.actor!);
  const sneakAttackDice = sneakAttack.number! - sneakAttackReduction;
  let formula = `${sneakAttackDice}${sneakAttack.die}`;
  // Alternate Rogue - Investigator - Exploit Weakness
  if (
    feat.actor!.classes['alternate-rogue'].system.levels >= 17 &&
    predictiveFightingTarget &&
    predictiveFightingTarget.origin!.includes(feat.actor!.id!)
  ) {
    formula = `${sneakAttackDice}d8`;
  }
  const dmgType = getWorkflowProperty(
    workflow,
    feat.actor!,
    'sneakAttackDamageType',
  ) as DamageType | undefined;
  await workflowUtils.bonusDamage(workflow, formula, { damageType: dmgType });
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
