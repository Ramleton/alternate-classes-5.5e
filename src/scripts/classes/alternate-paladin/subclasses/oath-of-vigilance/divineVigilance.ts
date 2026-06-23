import { runActivity } from 'automation/utils.js';
import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAuraRadius, getDivineFervorUses } from '../../utils/utils.js';

const allyBonus: MacroFunction = async ({
  trigger: { entity: item, roll, saveId, token, sourceActor },
}) => {
  console.log(item, roll, token, sourceActor);
  if (!sourceActor)
    return;
  if (!['int', 'wis', 'cha'].some(ability => ability === saveId))
    return;
  const feat = item as Item<'feat'>;
  if (getDivineFervorUses(feat.actor!) < 2)
    return;
  const targetValue = roll.options.target as number;
  if (targetValue && (roll.total >= targetValue))
    return;
  const { utils: {
    actorUtils,
    dialogUtils,
    rollUtils,
    socketUtils,
    tokenUtils,
  } } = chrisPremades;
  const source = roll.data.token ?? actorUtils.getFirstToken(sourceActor);
  if (!source) return;
  const range = getAuraRadius(feat.actor!) ?? 10;
  if (tokenUtils.getDistance(token, source) > range)
    return;
  if (targetValue && (roll.total >= targetValue))
    return;
  const userId = socketUtils.firstOwner(token.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    `Use a reaction to allow ${sourceActor.name} to reroll?`,
    { userId },
  );
  if (!selection)
    return;
  roll = await rollUtils.rollDice(roll.formula, { entity: sourceActor });
  await actorUtils.setReactionUsed(token.actor!);
  await runActivity(feat, 'use', [source]);
  return roll;
};
async function selfBonus({ trigger: { entity: item, saveId, roll } }) {
  if (!['int', 'wis', 'cha'].some(ability => ability === saveId))
    return;
  if (getDivineFervorUses(item.actor!) < 2)
    return;
  const targetValue = roll.options.target;
  if (targetValue && (roll.total >= targetValue)) return;
  const { utils: {
    actorUtils,
    dialogUtils,
    rollUtils,
  } } = chrisPremades;
  if (actorUtils.hasUsedReaction(item.parent))
    return;
  const selection = await dialogUtils.confirm(
    item.name,
    'Use a reaction to reroll your failed save?',
  );
  if (!selection) return;
  await actorUtils.setReactionUsed(item.parent);
  await runActivity(item as Item<'feat'>, 'use', [item.parent]);
  return await rollUtils.rollDice(roll.formula);
}

const macro: CPRMacro = {
  identifier: 'ac55eDivineVigilance',
  name: 'Oath of Vigilance: Divine Vigilance',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  save: [
    {
      pass: 'bonus',
      macro: selfBonus,
      priority: 100,
    },
    {
      pass: 'sceneBonus',
      macro: allyBonus,
      priority: 100,
      disposition: 'ally',
    },
  ],
};

export default macro;
