import {
  actorUtils,
  dialogUtils,
  effectUtils,
  itemUtils,
  socketUtils,
  tokenUtils,
  workflowUtils,
} from 'chrisPremades';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function pre(token, sourceToken, targetToken): Promise<any> {
  if (token.id === sourceToken.id)
    return [];
  if (token.id === targetToken.id)
    return [];
  const markEffect = effectUtils.getEffectByIdentifier(
    sourceToken.actor,
    'ac55eChivalricMarkEffect',
  );
  if (!markEffect) return [];
  if (actorUtils.hasUsedReaction(token.actor)) {
    const legendaryKnightErrant = itemUtils.getItemByIdentifier(
      token.actor,
      'ac55eLegendaryKnightErrant',
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(legendaryKnightErrant as any)?.system?.uses?.value) return;
  }
  const distance = tokenUtils.getDistance(token, sourceToken);
  const meleeWeapons = token.actor.items
    .filter(i => i.type === 'weapon')
    .filter(i => i.system.equipped)
    .filter(i => ['simpleM', 'martialM'].includes(i.system.type.value))
    .filter(i => i.system.range.reach >= distance);
  if (!meleeWeapons.length) return [];
  const selection = await dialogUtils.confirm(
    'Chivalric Mark: Reaction',
    'A marked creature attacked another, do you want to respond?',
    { userId: socketUtils.firstOwner(token.actor, true) },
  );
  if (!selection) return [];
  return meleeWeapons;
}

async function during(token, sourceToken, meleeWeapons) {
  let selectedWeapon;
  if (meleeWeapons.length === 1) {
    selectedWeapon = meleeWeapons[0];
  }
  else {
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      'Chivalric Mark: Select Weapon',
      'Select a weapon to use',
      meleeWeapons,
    );
  }
  if (!selectedWeapon) return;
  await workflowUtils.syntheticItemRoll(
    selectedWeapon,
    [sourceToken],
    { userId: socketUtils.firstOwner(token.actor, true) },
  );
  return true;
}
async function workflow({ trigger: { token, sourceToken, targetToken } }) {
  const res1 = await pre(token, sourceToken, targetToken);
  if (!res1.length) return;
  await during(token, sourceToken, res1);
}

export const ac55eChivalricMark = {
  name: 'Chivalric Mark',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneApplyDamage',
        macro: workflow,
        priority: 250,
      },
    ],
  },
};
