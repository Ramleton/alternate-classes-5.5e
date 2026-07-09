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

const isFinesseOrRangedAttack = (workflow: Workflow): boolean => {
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  return (
    (actionType === 'mwak' &&
      (workflow.item as Item<'weapon'>).system.properties.has('fin')) ||
    actionType === 'rwak'
  );
};

/**
 * Alternate Rogue - Scout - Twin Strike
 *
 * When you take the Attack action, you can make one weapon attack as a bonus
 * action on that same turn. You can also apply your Sneak Attack bonus to this
 * attack, even if you have already used it on this turn, so long as these
 * attacks do not target the same creature.
 */
const isTwinStrikeBlocking = (
  sneakAttack: Item<'feat'>,
  target: Token,
): boolean => {
  const {
    utils: { effectUtils, itemUtils },
  } = chrisPremades;
  const twinStrike = itemUtils.getItemByIdentifier(
    sneakAttack.actor!,
    'ac55eTwinStrike',
  );
  return !!(
    twinStrike &&
    effectUtils.getEffectByIdentifier(target.actor!, 'ac55eSneakAttacked')
  );
};

/**
 * Alternate Rogue - Mastermind - Potent Insight
 *
 * When you use the Help action to aid an ally in attacking a creature and
 * their attack hits, you can use your reaction to add your Sneak Attack bonus
 * to its damage roll. However, if you do so, you cannot use Sneak Attack on
 * your next turn.
 */
const isPotentSightBlocking = (sneakAttack: Item<'feat'>): boolean => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const potentInsightEffect = effectUtils.getEffectByIdentifier(
    sneakAttack.actor!,
    'ac55ePotentInsightEffect',
  );
  return !!potentInsightEffect;
};

export const qualifiesForSneakAttack = (
  sneakAttack: Item<'feat'>,
  token: Token,
  workflow: Workflow,
): boolean => {
  const {
    utils: { effectUtils, itemUtils, tokenUtils },
  } = chrisPremades;
  if (!workflow.targets.size) return false;
  if (isTwinStrikeBlocking(sneakAttack, token)) return false;
  if (getWorkflowProperty(workflow, sneakAttack.actor!, 'sneakAttack'))
    return false;
  if (!isFinesseOrRangedAttack(workflow)) return false;
  if (isPotentSightBlocking(sneakAttack)) return false;
  const target = workflow.targets.first() as Token;
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
  const viableNearbyEnemies =
    (distanceToTarget <= 5 && nearbyEnemies > 1) || !!nearbyEnemies;
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
    (hadAdvantage || viableNearbyEnemies) && !hadDisadvantage;
  return sneakAttackApplies || swashbucklerSneakAttackApplies;
};
