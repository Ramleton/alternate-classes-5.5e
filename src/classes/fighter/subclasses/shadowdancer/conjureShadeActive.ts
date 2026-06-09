import {
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  Summons,
  tokenUtils,
  workflowUtils,
} from 'chrisPremades';

async function turnEnd({ trigger: { entity: effect, token } }) {
  const sceneShades = effect
    .flags['alternate-classes-55e']
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
  let echosLeft = sceneShades.length;
  for (const i of sceneShades) {
    const distance = tokenUtils.getDistance(token, i);
    if (distance > maxRange) {
      const selection = await dialogUtils.confirm(
        effect.name,
        genericUtils.format(
          'Your Shade is too far away, it is destroyed',
          { actorName: token.actor.name },
        ),
        { userId: socketUtils.gmID() },
      );
      if (!selection) continue;
      const tokenEffect = effectUtils.getEffectByIdentifier(
        i.actor,
        'ac55eSummonedEffect',
      );
      if (tokenEffect) await genericUtils.remove(tokenEffect);
      echosLeft -= 1;
    }
  }
  if (!echosLeft) await genericUtils.remove(effect);
}
async function targetApplyDamage({ trigger, ditem }) {
  if (!(await Summons.dismissIfDead({ trigger, ditem }))) return;
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
  if (originActor.system.attributes.hp.temp) return;
  const originItem = itemUtils.getItemByIdentifier(
    originActor,
    'ac55eRestorativeShadows',
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!originItem || !(originItem as any).system.uses.value) return;
  const selection = await dialogUtils.confirm(
    originItem.name,
    genericUtils.format(
      'CHRISPREMADES.Dialog.Use',
      { itemName: originItem.name },
    ),
  );
  if (!selection) return;
  await workflowUtils.completeItemUse(
    originItem,
    {},
    { configureDialog: false },
  );
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
