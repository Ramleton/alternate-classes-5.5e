import { Workflow } from '@midi-qol/types/module/Workflow.js';
import {
  getWorkflowProperty,
  setWorkflowProperty,
} from 'automation/workflowUtils.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';

export const getSneakAttack = (actor: Actor5e) => {
  return actor.system.scale['alternate-rogue']?.[
    'sneak-attack'
  ] as ScaleValueTypeDice;
};

export const reduceSneakAttack = (
  workflow: Workflow,
  actor: Actor5e,
  amount: number,
) => {
  const currReduction =
    (getWorkflowProperty(workflow, actor, 'sneakAttackReduction') as number) ??
    0;
  setWorkflowProperty(
    workflow,
    actor,
    'sneakAttackReduction',
    currReduction + amount,
  );
};

export const qualifiesForSneakAttack = (
  sneakAttack: Item<'feat'>,
  token: Token,
  workflow: Workflow,
): boolean => {
  const {
    utils: { effectUtils, itemUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const twinStrike = itemUtils.getItemByIdentifier(
    sneakAttack.actor!,
    'ac55eTwinStrike',
  );
  if (!twinStrike && !sneakAttack.system.uses?.value) return false;
  const target = workflow.targets.first() as Token;
  if (
    twinStrike &&
    effectUtils.getEffectByIdentifier(target.actor!, 'ac55eSneakAttacked')
  )
    return false;
  if (getWorkflowProperty(workflow, sneakAttack.actor!, 'sneakAttack'))
    return false;
  const actionType = workflowUtils.getActionType(workflow);
  // If the attack is not a finesse or ranged weapon attack, don't prompt
  if (
    !(
      actionType === 'mwak' &&
      (workflow.item as Item<'weapon'>).system.properties.has('fin')
    ) &&
    actionType !== 'rwak'
  )
    return false;
  /**
   * Alternate Rogue - Mastermind - Potent Insight
   *
   * When you use the Help action to aid an ally in attacking a creature and
   * their attack hits, you can use your reaction to add your Sneak Attack bonus
   * to its damage roll. However, if you do so, you cannot use Sneak Attack on
   * your next turn.
   */
  const potentInsightEffect = effectUtils.getEffectByIdentifier(
    sneakAttack.actor!,
    'ac55ePotentInsightEffect',
  );
  if (potentInsightEffect) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attackRollOptions = workflow.attackRoll!.options as any;
  const hadAdvantage = attackRollOptions.attributions?.some(
    (a: { type: string }) => a.type === 'ADV',
  );
  const hadDisadvantage = attackRollOptions.attributions?.some(
    (a: { type: string }) => a.type === 'DIS',
  );
  const distanceToTarget = tokenUtils.getDistance(token, target);
  const nearbyEnemies = tokenUtils.findNearby(target, 5, 'enemy', {
    includeIncapacitated: false,
    includeToken: false,
  }).length;
  if (distanceToTarget <= 5 && nearbyEnemies < 2) {
    return false;
  } else if (!nearbyEnemies) {
    return false;
  }
  const predictiveFightingEffect = effectUtils.getEffectByIdentifier(
    target.actor!,
    'ac55ePredictiveFightingTarget',
  );
  if (predictiveFightingEffect) {
    return !!nearbyEnemies && !hadDisadvantage;
  }
  const relentlessSwagger = itemUtils.getItemByIdentifier(
    sneakAttack.actor!,
    'ac55eRelentlessSwagger',
  ) as Item<'feat'> | undefined;
  const nearbyUser = tokenUtils.findNearby(token, 5, 'any', {
    includeIncapacitated: true,
    includeToken: false,
  }).length;
  const swashbucklerSneakAttackApplies =
    relentlessSwagger &&
    distanceToTarget <= 5 &&
    nearbyUser <= 1 &&
    !hadDisadvantage;
  const sneakAttackApplies =
    (hadAdvantage || !!nearbyEnemies) && !hadDisadvantage;
  return sneakAttackApplies || swashbucklerSneakAttackApplies;
};
