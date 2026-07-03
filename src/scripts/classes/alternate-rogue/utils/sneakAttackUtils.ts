import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';

export const getSneakAttack = (actor: Actor5e) => {
  return actor.system.scale['alternate-rogue']?.[
    'sneak-attack'
  ] as ScaleValueTypeDice;
};

export const qualifiesForSneakAttack = (
  feat: Item<'feat'>,
  workflow: Workflow,
): boolean => {
  if (!feat.system.uses?.value) return false;
  const {
    utils: { tokenUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  // If the attack is not a finesse or ranged weapon attack, don't prompt
  if (
    !(
      actionType === 'mwak' &&
      (workflow.item as Item<'weapon'>).system.properties.some(
        (p) => p === 'fin',
      )
    ) &&
    actionType !== 'rwak'
  )
    return false;
  const target = workflow.targets.first() as Token;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attackRollOptions = workflow.attackRoll!.options as any;
  const hadAdvantage = attackRollOptions.attributions.some(
    (a: { type: string }) => a.type === 'ADV',
  );
  const hadDisadvantage = attackRollOptions.attributions.some(
    (a: { type: string }) => a.type === 'DIS',
  );
  const nearbyEnemy = !!tokenUtils.findNearby(target, 5, 'enemy', {
    includeIncapacitated: false,
    includeToken: false,
  }).length;
  return (hadAdvantage || nearbyEnemy) && !hadDisadvantage;
};
