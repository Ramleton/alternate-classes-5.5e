import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getSneakAttack } from '../utils/sneakAttackUtils.js';

const prompt: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  const {
    utils: { genericUtils, socketUtils, tokenUtils, workflowUtils },
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
    return;
  const target = workflow.hitTargets.first() as Token;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attackRollOptions = workflow.attackRoll!.options as any;
  const hadAdvantage = attackRollOptions.attributions.some(
    (a) => a.type === 'ADV',
  );
  const hadDisadvantage = attackRollOptions.attributions.some(
    (a) => a.type === 'DIS',
  );
  const nearbyEnemy = !!tokenUtils.findNearby(target, 5, 'enemy', {
    includeIncapacitated: false,
    includeToken: false,
  }).length;
  const qualifiesForSneakAttack =
    (hadAdvantage || nearbyEnemy) && !hadDisadvantage;
  if (!qualifiesForSneakAttack) return;
  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await chrisPremades.utils.dialogUtils.confirmUseItem(feat, {
    userId,
  });
  if (!selection) return;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.sneak-attack',
    1,
  );
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses!.spent + 1,
  });
};

const damageBonus: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const useSneakAttack =
    feat.actor!.flags['alternate-classes-55e']?.macros?.['sneak-attack'];
  if (!useSneakAttack) return;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  await genericUtils.unsetFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.sneak-attack',
  );
  const sneakAttack = getSneakAttack(feat.actor!);
  await workflowUtils.bonusDamage(workflow, sneakAttack.formula);
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
        priority: 100,
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
