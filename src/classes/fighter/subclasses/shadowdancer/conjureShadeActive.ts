import {
  activityUtils,
  actorUtils,
  constants,
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  Summons,
  tokenUtils,
  workflowUtils,
} from 'chrisPremades';
import AlternateClasses55e from '../../../../types/alternate-classes-55e';

async function turnEnd({ trigger: { entity: effect, token } }) {
  const sceneShades = effect
    .flags['chris-premades']
    .summons
    .ids[effect.name]
    .map(i => token.scene.tokens.get(i)?.object)
    .filter(i => i);
  if (!sceneShades.length) {
    await genericUtils.remove(effect);
    return;
  }
  const maxRange = effectUtils.getEffectByIdentifier(
    token.actor,
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
      if (tokenEffect) await genericUtils.remove(tokenEffect);
      shadesLeft -= 1;
    }
  }
  if (!shadesLeft) await genericUtils.remove(effect);
}
async function targetApplyDamage({ trigger, ditem }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effect: any = await fromUuid(trigger
    .entity
    ?.flags
    ?.['chris-premades']
    ?.parentEntityUuid,
  );
  if (!effect) return;
  const originActor = effect.parent;
  if (!originActor) return;
  const originItem = itemUtils.getItemByIdentifier(
    originActor,
    'ac55eRestorativeShadows',
  );
  if (!originItem) return;
  const altClassesModule = game
    .modules.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const exploitDie = altClassesModule.api
    .getAlternateMartialExploitDie(originItem);
  if (!exploitDie) return;
  const healActivity = activityUtils.getActivityByIdentifier(
    originItem,
    'heal',
    { strict: true },
  );
  const healData = await genericUtils.duplicate(healActivity);
  healData.healing.custom.formula = `2d${exploitDie.faces}`;
  await workflowUtils.syntheticActivityDataRoll(
    healData,
    originItem,
    originActor,
    [],
  );
  await Summons.dismissIfDead({ trigger, ditem });
}

async function darkSacrifice({ trigger, workflow, ditem }) {
  if (!constants.attacks.includes(workflow.activity.getActionType()))
    return;
  const token = trigger.token;
  const sourceToken = trigger.sourceToken;
  const targetToken = workflow.hitTargets.first();
  if (token.id === targetToken.id) return;
  if (token.id === sourceToken.id) return;
  const distance = tokenUtils.getDistance(token, targetToken);
  if (distance > 10) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effect: any = await fromUuid(trigger
    .entity
    ?.flags
    ?.['chris-premades']
    ?.parentEntityUuid,
  );
  if (!effect) return;
  const originActor = effect.parent;
  if (!originActor) return;
  if (actorUtils.hasUsedReaction(originActor)) return;
  const darkSacrifice = itemUtils.getItemByIdentifier(
    originActor,
    'ac55eDarkSacrifice',
  );
  if (!darkSacrifice) return;
  const fighterLevels = originActor.classes['alternate-fighter'].system.levels;
  const selection = await dialogUtils.confirm(
    'Dark Sacrifice',
    'A creature within 10 feet of a Shade is hit, sacrifice it?',
    { userId: socketUtils.firstOwner(token.actor, true) },
  );
  if (!selection) return;
  workflowUtils.modifyDamageAppliedFlat(ditem, -fighterLevels);
  await actorUtils.setReactionUsed(originActor);
  await Summons.dismiss({ trigger });
}

export const ac55eConjureShadeActive = {
  name: 'Conjure Shade: Active',
  version: '1.0.0',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: targetApplyDamage,
        priority: 50,
      },
      {
        pass: 'sceneDamageRoll',
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
