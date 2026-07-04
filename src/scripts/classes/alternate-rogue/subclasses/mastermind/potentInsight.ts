import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getSneakAttack } from '../../utils/sneakAttackUtils.js';

/**
 * Alternate Rogue - Mastermind - Potent Insight
 *
 * When you use the Help action to aid an ally in attacking a creature and
 * their attack hits, you can use your reaction to add your Sneak Attack bonus
 * to its damage roll. However, if you do so, you cannot use Sneak Attack on
 * your next turn.
 */
const prompt: MidiMacroFunction = async ({
  trigger: { entity, sourceActor },
  workflow,
}) => {
  const {
    utils: {
      actorUtils,
      constants,
      dialogUtils,
      effectUtils,
      socketUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.attacks.some((type) => type === actionType)) return;
  const target = workflow.hitTargets.first()! as Token;
  const tacticalAcumenEffect = effectUtils.getEffectByIdentifier(
    target.actor!,
    'ac55eTacticalAcumenEffect',
  );
  if (!tacticalAcumenEffect) return;
  if (!tacticalAcumenEffect.origin!.includes(feat.actor!.id!)) return;
  await tacticalAcumenEffect.delete();
  const selection = dialogUtils.confirm(
    feat.name,
    `Add your Sneak Attack bonus to ${sourceActor!.name}'s damage roll?`,
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return;
  const sneakAttack = getSneakAttack(feat.actor!);
  if (!sneakAttack) return;
  await workflowUtils.bonusDamage(workflow, sneakAttack.formula);
  await runActivity(feat, 'use', []);
};

const macro: CPRMacro = {
  identifier: 'ac55ePotentInsight',
  name: 'Mastermind: Potent Insight',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneDamageRollComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
};

export default macro;
