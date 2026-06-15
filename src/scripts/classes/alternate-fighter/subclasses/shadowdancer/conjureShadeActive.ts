import CPRMacro, { MacroFunction, MidiMacroFunction } from 'chris-premades/macro.js';
import { getActivityData } from 'exploits/handling/exploitUtils.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { HealActivity } from 'fvtt-types/Activity.js';

const turnEnd: MacroFunction = async (
  { trigger: { entity: effect, token } },
) => {
  const sceneShades = effect
    .flags['chris-premades']
    .summons
    .ids[effect.name]
    .map(i => token.scene.tokens.get(i)?.object)
    .filter(i => i);
  const { utils: { effectUtils, genericUtils, tokenUtils } } = chrisPremades;
  if (!sceneShades.length) {
    await genericUtils.remove(effect);
    return;
  }
  const maxRange = effectUtils.getEffectByIdentifier(
    token.actor!,
    'ac55eTransferConsciousness',
  )
    ? 1000
    : 30;
  let shadesLeft = sceneShades.length;
  for (const i of sceneShades) {
    const distance = tokenUtils.getDistance(token, i);
    if (distance > maxRange) {
      genericUtils.notify(
        'Your Shade is too far away, it is destroyed',
        'info',
      );
      const tokenEffect = effectUtils.getEffectByIdentifier(
        i.actor,
        'ac55eSummonedEffect',
      );
      if (tokenEffect)
        await genericUtils.remove(tokenEffect);
      shadesLeft -= 1;
    }
  }
  if (!shadesLeft)
    await genericUtils.remove(effect);
};
const targetApplyDamage: MacroFunction = async ({ trigger, ditem }) => {
  const effect = await fromUuid(trigger
    .entity
    ?.flags?.['chris-premades']
    ?.parentEntityUuid);
  if (!effect)
    return;
  const originActor = effect.parent;
  if (!originActor)
    return;
  const {
    Summons,
    utils: {
      itemUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const originItem = itemUtils.getItemByIdentifier(
    originActor,
    'ac55eRestorativeShadows',
  );
  if (!originItem)
    return;
  const feat = originItem as Item<'feat'>;
  const exploitDie = getAlternateMartialExploitDie(feat);
  if (!exploitDie)
    return;
  const healActivityData = await getActivityData(
    feat,
    'heal',
  ) as HealActivity | undefined;
  if (!healActivityData)
    return;
  healActivityData.healing.custom.formula = `2d${exploitDie.faces}`;
  await workflowUtils.syntheticActivityDataRoll(
    healActivityData,
    originItem,
    originActor,
    [],
  );
  await Summons.dismissIfDead({ trigger, ditem });
};
const darkSacrifice: MidiMacroFunction = async (
  { trigger, workflow, ditem },
) => {
  if (!ditem)
    return;
  const {
    Summons,
    utils: {
      actorUtils,
      constants,
      dialogUtils,
      itemUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (!constants.attacks.includes(workflow.activity.getActionType()))
    return;
  const token = trigger.token;
  const sourceToken = trigger.sourceToken!;
  const targetToken = workflow.hitTargets.first()! as Token;
  if (token.id === targetToken.id)
    return;
  if (token.id === sourceToken.id)
    return;
  const distance = tokenUtils.getDistance(token, targetToken);
  if (distance > 10)
    return;

  const effect = await fromUuid(trigger
    .entity
    ?.flags?.['chris-premades']
    ?.parentEntityUuid);
  if (!effect)
    return;
  const originActor = effect.parent as Actor5e;
  if (!originActor)
    return;
  if (actorUtils.hasUsedReaction(originActor))
    return;
  const darkSacrifice = itemUtils.getItemByIdentifier(
    originActor,
    'ac55eDarkSacrifice',
  );
  if (!darkSacrifice)
    return;
  const fighterLevels = originActor.classes['alternate-fighter'].system.levels;
  const selection = await dialogUtils.confirm(
    'Dark Sacrifice',
    'A creature within 10 feet of a Shade is hit, sacrifice it?',
    { userId: socketUtils.firstOwner(token.actor, true) });
  if (!selection)
    return;
  workflowUtils.modifyDamageAppliedFlat(ditem, -fighterLevels);
  await actorUtils.setReactionUsed(originActor);
  await Summons.dismiss({ trigger });
};
const macro: CPRMacro = {
  identifier: 'ac55eConjureShadeActive',
  name: 'Conjure Shade: Active',
  rules: 'modern',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: targetApplyDamage,
        priority: 50,
      },
      {
        pass: 'sceneApplyDamage',
        macro: darkSacrifice,
        priority: 50,
      },
    ],
  },
  combat: [
    {
      pass: 'turnEnd',
      macro: turnEnd,
      priority: 50,
    },
  ],
};

export default macro;
