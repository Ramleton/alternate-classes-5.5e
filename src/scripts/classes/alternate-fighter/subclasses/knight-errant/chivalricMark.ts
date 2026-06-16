import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MacroFunction, MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData } from '../../../../../types/effects.js';

const preApply = async (
  feat: Item<'feat'>,
  workflow: Workflow,
  unyieldingKnight?: Item<'feat'>,
): Promise<boolean> => {
  if (!workflow.hitTargets.size)
    return false;
  const target = workflow.hitTargets.first()! as Token;
  const { utils: { dialogUtils, effectUtils, socketUtils } } = chrisPremades;
  const markEffect = effectUtils.getEffectByIdentifier(
    target.actor!,
    'ac55eChivalricMarkEffect',
  );
  // Actor.M2aqn544Vjl9qOQS.Item.LNLxIHyXvgKQC5yA
  if (markEffect && markEffect.origin === feat.actor!.uuid)
    return false;
  if (!unyieldingKnight) {
    const selection = await dialogUtils.confirmUseItem(feat, {
      userId: socketUtils.firstOwner(feat.actor, true),
    });
    return selection;
  }
  return true;
};
const duringApply = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<boolean> => {
  const target = workflow.hitTargets.first()! as Token;
  const maxDistance = (feat.actor! as Actor5e)
    .classes['alternate-fighter']
    .levels >= 10
    ? 30
    : 10;
  const { utils: { effectUtils } } = chrisPremades;
  const effectData: EffectData = {
    name: 'Chivalric Mark: Marked',
    icon: feat.img!,
    origin: feat.actor!.uuid!,
    duration: { rounds: 2 },
    flags: {
      'alternate-classes-55e': {
        macros: {
          chivalricMark: { distance: maxDistance },
        },
      },
      'dae': {
        specialDuration: ['turnEndSource'],
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eChivalricMarkEffect',
        },
      },
    },
    changes: [{
      key: 'flags.automated-conditions-5e.attack.disadvantage',
      mode: 0,
      // eslint-disable-next-line @stylistic/max-len
      value: `opponentId !== effectOriginTokenId && checkDistance(tokenId, effectOriginTokenId) <= ${maxDistance}`,
      priority: 20,
    }],
    statuses: [],
  };
  await effectUtils.createEffect(target.actor!, effectData);
  return true;
};
const postApply = async (feat: Item<'feat'>) => {
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.update(
    feat,
    { 'system.uses.spent': feat.system.uses!.spent + 1 },
  );
};
const applyWorkflow: MidiMacroFunction = async (
  { trigger: { entity: item }, workflow },
) => {
  const feat = item as Item<'feat'>;
  if (!feat.actor)
    return;
  const { utils: { itemUtils } } = chrisPremades;
  const unyieldingKnight = itemUtils.getItemByIdentifier(
    feat.actor,
    'ac55eUnyieldingKnight',
  ) as Item<'feat'> | undefined;
  if (!feat.system.uses?.value && !unyieldingKnight)
    return;
  const res1 = await preApply(feat, workflow, unyieldingKnight);
  if (!res1)
    return;
  const res2 = await duringApply(feat, workflow);
  if (!res2)
    return;
  if (!unyieldingKnight)
    await postApply(feat);
};

const preSource = async (
  token: Token,
  sourceToken: Token,
  targetToken: Token,
): Promise<Item<'weapon'>[]> => {
  if (token.id === sourceToken.id)
    return [];
  if (token.id === targetToken.id)
    return [];
  if (!sourceToken.actor)
    return [];
  if (!token.actor)
    return [];
  const { utils: {
    actorUtils,
    dialogUtils,
    effectUtils,
    itemUtils,
    socketUtils,
    tokenUtils,
  } } = chrisPremades;
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
    if (!legendaryKnightErrant?.system?.uses?.value)
      return [];
  }
  const distance = tokenUtils.getDistance(token, sourceToken);
  const meleeWeapons = token.actor.items
    .filter(i => i.type === 'weapon')
    .filter(i => i.system.equipped)
    .filter(i => ['simpleM', 'martialM'].includes(i.system.type.value))
    .filter(i => i.system.range.reach >= distance) as Item<'weapon'>[];
  if (!meleeWeapons.length)
    return [];
  const selection = await dialogUtils.confirm(
    'Chivalric Mark: Reaction',
    'A marked creature attacked another, do you want to respond?',
    { userId: socketUtils.firstOwner(token.actor, true) });
  if (!selection)
    return [];
  return meleeWeapons;
};
const duringSource = async (
  token: Token,
  sourceToken: Token,
  meleeWeapons: Item<'weapon'>[],
): Promise<boolean> => {
  const { utils: { dialogUtils, socketUtils, workflowUtils } } = chrisPremades;
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
  if (!selectedWeapon)
    return false;
  await workflowUtils.syntheticItemRoll(
    selectedWeapon,
    [sourceToken],
    { userId: socketUtils.firstOwner(token.actor, true) },
  );
  return true;
};
const sourceWorkflow: MidiMacroFunction = async (
  { trigger: { token, sourceToken, targetToken } },
) => {
  if (!sourceToken)
    return;
  if (!targetToken)
    return;
  const res1 = await preSource(token, sourceToken, targetToken);
  if (!res1.length)
    return;
  await duringSource(token, sourceToken, res1);
};

const movedWorkflow: MacroFunction = async ({
  trigger: { entity: item, token, target },
}) => {
  const feat = item as Item<'feat'>;
  if (!feat.actor)
    return;
  if (!target || !target.actor)
    return;
  const { utils: { effectUtils, genericUtils, tokenUtils } } = chrisPremades;
  const markEffect = effectUtils.getEffectByIdentifier(
    target.actor,
    'ac55eChivalricMarkEffect',
  );
  if (!markEffect)
    return;
  if (markEffect.origin !== feat.actor.uuid)
    return;
  const effectMaxDistance = markEffect
    .flags['alternate-classes-55e']
    ?.macros
    ?.chivalricMark
    ?.distance;
  if (tokenUtils.getDistance(token, target) > effectMaxDistance)
    await genericUtils.remove(markEffect);
};

const macro: CPRMacro = {
  identifier: 'ac55eChivalricMark',
  name: 'Chivalric Mark',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: applyWorkflow,
        priority: 100,
      },
      {
        pass: 'sceneApplyDamage',
        macro: sourceWorkflow,
        priority: 250,
      },
    ],
  },
  movement: [{
    pass: 'movedScene',
    macro: movedWorkflow,
    priority: 100,
  }],
};

export default macro;
