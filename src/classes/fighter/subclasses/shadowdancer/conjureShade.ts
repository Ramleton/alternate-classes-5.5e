import {
  activityUtils,
  actorUtils,
  compendiumUtils,
  constants,
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  Summons,
  Teleport,
  workflowUtils,
} from 'chrisPremades';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TokenMagic: any = {};

async function use({ workflow }): Promise<void> {
  const sourceActor = await compendiumUtils.getActorFromCompendium(
    'alternate-classes-55e.actors',
    'Shadowdancer Shade',
  );
  if (!sourceActor) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let effect: any = effectUtils.getEffectByIdentifier(
    workflow.actor,
    'ac55eConjureShade',
  );
  let sceneShades = [];
  if (effect) sceneShades = effect
    .flags['chris-premades']
    .summons
    .ids[effect.name].map(i => workflow.token.scene.tokens.get(i));
  const teleportFeature = activityUtils.getActivityByIdentifier(
    workflow.item,
    'teleport',
    { strict: true },
  );
  const attackFeature = activityUtils.getActivityByIdentifier(
    workflow.item,
    'attack',
    { strict: true },
  );
  const dismissFeature = activityUtils.getActivityByIdentifier(
    workflow.item,
    'dismiss',
    { strict: true },
  );
  if (!teleportFeature || !attackFeature || !dismissFeature) return;
  const legendaryShadowdancer = itemUtils.getItemByIdentifier(
    workflow.actor,
    'ac55eLegendaryShadowdancer',
  );
  let makeTwo = false;
  if (legendaryShadowdancer) {
    if (!sceneShades.length) {
      makeTwo = await dialogUtils.confirm(
        workflow.item.name,
        'Conjure two shades?',
      );
    }
    else if (sceneShades.length > 1) {
      await genericUtils.remove(effect);
    }
  }
  else if (effect) {
    genericUtils.remove(effect);
  }
  let name = itemUtils.getConfig(workflow.item, 'name');
  if (!name?.length) name = `${workflow.actor.name}'s Shade`;
  const updates = {
    actor: {
      name,
      img: undefined,
      system: {
        abilities: workflow.actor.system.abilities,
        details: {
          cr: actorUtils.getCRFromProf(workflow.actor.system.attributes.prof),
          type: workflow.actor.system.details.type,
        },
        traits: {
          size: workflow.actor.system.traits.size,
        },
        attributes: {
          ac: {
            flat: 14 + workflow.actor.system.abilities.cha.mod,
            calc: 'flat',
          },
          senses: workflow.actor.system.senses,
        },
      },
      prototypeToken: {
        name,
        sight: workflow.actor.prototypeToken.sight,
        width: workflow.token.document.width,
        height: workflow.token.document.height,
      },
    },
    token: {
      name,
      sight: workflow.actor.prototypeToken.sight,
      width: workflow.token.document.width,
      height: workflow.token.document.height,
    },
  };
  const avatarImg = itemUtils.getConfig(workflow.item, 'avatar');
  let tokenImg = itemUtils.getConfig(workflow.item, 'token');
  if (!tokenImg?.length) tokenImg = workflow.token.document.texture.src;
  if (avatarImg) updates.actor.img = avatarImg;
  if (tokenImg) {
    genericUtils.setProperty(
      updates,
      'actor.prototypeToken.texture.src',
      tokenImg,
    );
    genericUtils.setProperty(updates, 'token.texture.src', tokenImg);
  }
  const animation = itemUtils.getConfig(workflow.item, 'animation') ?? 'none';
  const vaeButtons = [
    {
      type: 'use',
      name: teleportFeature.name,
      identifier: 'ac55eConjureShade',
      activityIdentifier: 'teleport',
    },
    {
      type: 'use',
      name: attackFeature.name,
      identifier: 'ac55eConjureShade',
      activityIdentifier: 'attack',
    },
  ];
  const transferConsciousness = itemUtils.getItemByIdentifier(
    workflow.actor,
    'ac55eTransferConsciousness',
  );
  if (transferConsciousness)
    vaeButtons.push({
      type: 'use',
      name: transferConsciousness.name,
      identifier: 'ac55eTransferConsciousness',
      activityIdentifier: '',
    });
  const spawnedTokens = await Summons.spawn(
    makeTwo ? [sourceActor, sourceActor] : sourceActor,
    updates,
    workflow.item,
    workflow.token, {
      range: 15,
      animation,
      initiativeType: 'follows',
      dismissActivity: dismissFeature,
      additionalVaeButtons: vaeButtons,
      unhideActivities: {
        itemUuid: workflow.item.uuid,
        activityIdentifiers: [
          'teleport',
          'attack',
          'dismiss',
        ],
        favorite: true,
      },
    },
  );
  if (!spawnedTokens?.length) return;
  effect = effectUtils.getEffectByIdentifier(
    workflow.actor,
    'ac55eConjureShade',
  );
  if (!effect) return;
  await genericUtils.update(
    effect,
    { 'flags.chris-premades.macros.combat': ['conjureShadeActive'] },
  );
  const applyFilter = (itemUtils.getConfig(workflow.item, 'filter') ?? true)
    && game.modules.get('tokenmagic')?.active;
  const filter = [
    {
      filterType: 'oldfilm',
      filterId: 'myOldfilm',
      sepia: 0.6,
      noise: 0.2,
      noiseSize: 1.0,
      scratch: 0.8,
      scratchDensity: 0.5,
      scratchWidth: 1.2,
      vignetting: 0.9,
      vignettingAlpha: 0.6,
      vignettingBlur: 0.2,
      animated:
            {
              seed: {
                active: true,
                animType: 'randomNumber',
                val1: 0,
                val2: 1,
              },
              vignetting: {
                active: true,
                animType: 'syncCosOscillation',
                loopDuration: 2000,
                val1: 0.2,
                val2: 0.4,
              },
            },
    },
    {
      filterType: 'outline',
      filterId: 'oldfilmOutline',
      color: 0x000000,
      thickness: 0,
      zOrder: 61,
    },
    {
      filterType: 'fog',
      filterId: 'myFog',
      color: 0x000000,
      density: 0.65,
      time: 0,
      dimX: 1,
      dimY: 1,
      animated: {
        time: {
          active: true,
          speed: 2.2,
          animType: 'move',
        },
      },
    },
  ];
  const restorativeShadows = itemUtils.getItemByIdentifier(
    workflow.actor,
    'ac55eRestorativeShadows',
  );
  for (const i of spawnedTokens) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (applyFilter) await TokenMagic.addFilters((i as any).object, filter);
    if (!restorativeShadows) continue;
    const targetEffect = effectUtils.getEffectByIdentifier(
      i.actor,
      'ac55eSummonedEffect',
    );
    await genericUtils.update(
      targetEffect,
      { 'flags.chris-premades.macros.midi.actor':
        ['conjureShadeActive'],
      },
    );
  }
}

async function dismiss({ workflow }) {
  const effect = effectUtils.getEffectByIdentifier(
    workflow.actor,
    'ac55eConjureShade',
  );
  if (effect) await genericUtils.remove(effect);
}

async function teleport({ workflow }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effect: any = effectUtils.getEffectByIdentifier(
    workflow.actor,
    'ac55eConjureShade',
  );
  if (!effect) return;

  const sceneShades = effect
    .flags['chris-premades']
    .summons
    .ids[effect.name]
    .map(i => workflow.token.scene.tokens.get(i)?.object)
    .filter(i => i);
  if (!sceneShades.length) return;
  let targetToken;
  if (sceneShades.length > 1) {
    const selection = await dialogUtils.selectTargetDialog(
      workflow.item.name,
      'Teleport to which shade?',
      sceneShades,
    );
    if (!selection?.length) return;
    targetToken = selection[0];
  }
  else {
    targetToken = sceneShades[0];
  }
  const origPos = workflow.token.center;
  const newPos = targetToken.center;
  const playAnimation = itemUtils.getConfig(workflow.item, 'playAnimation');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const origTeleport: any = new Teleport(
    [workflow.token],
    workflow.token,
    { animation: playAnimation ? 'mistyStep' : 'none' },
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newTeleport: any = new Teleport(
    [targetToken],
    targetToken,
    { animation: playAnimation ? 'mistyStep' : 'none' },
  );
  origTeleport.template = {
    direction: 0,
    x: newPos.x,
    y: newPos.y,
  };
  newTeleport.template = {
    direction: 0,
    x: origPos.x,
    y: origPos.y,
  };
  await Promise.all([origTeleport._move(), newTeleport._move()]);
}

async function attack({ workflow }) {
  if (!workflow.targets.size) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effect: any = effectUtils.getEffectByIdentifier(
    workflow.actor,
    'ac55eConjureShade',
  );
  if (!effect) return;
  const sceneShades = effect
    .flags['chris-premades']
    .summons
    .ids[effect.name]
    .map(i => workflow.token.scene.tokens.get(i)?.object).filter(i => i);
  if (!sceneShades.length) return;
  let targetToken;
  if (sceneShades.length > 1) {
    const selection = await dialogUtils.selectTargetDialog(
      workflow.item.name,
      'Attack from which shade?',
      sceneShades,
    );
    if (!selection?.length) return;
    targetToken = selection[0];
  }
  else {
    targetToken = sceneShades[0];
  }
  const features = workflow
    .actor
    .items
    .filter(i =>
      i.hasAttack
      && (i.type === 'weapon' ? i.system.equipped : true),
    );
  if (!features.length) {
    genericUtils.notify('No equipped weapons', 'info');
    return;
  }
  let feature;
  if (features.length > 1) {
    feature = await dialogUtils.selectDocumentDialog(
      workflow.item.name,
      'Attack with which weapon?',
      features,
    );
    if (!feature) return;
  }
  else {
    feature = features[0];
  }
  const effectData = {
    name: 'Range Override',
    img: constants.tempConditionIcon,
    origin: workflow.item.uuid,
    changes: [
      {
        key: 'flags.midi-qol.rangeOverride.attack.all',
        mode: 0,
        value: 1,
        priority: 20,
      },
    ],
    flags: {
      'chris-premades': {
        effect: {
          noAnimation: true,
        },
      },
    },
  };
  const effect1 = await effectUtils.createEffect(workflow.actor, effectData);
  const effect2 = await effectUtils.createEffect(targetToken.actor, effectData);
  await workflowUtils.syntheticItemRoll(feature, Array.from(workflow.targets));
  await genericUtils.remove(effect1);
  await genericUtils.remove(effect2);
}

export const conjureShade = {
  name: 'Conjure Shade',
  version: '1.1.0',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: use,
        priority: 50,
        activities: ['conjure'],
      },
      {
        pass: 'rollFinished',
        macro: teleport,
        priority: 50,
        activities: ['teleport'],
      },
      {
        pass: 'rollFinished',
        macro: attack,
        priority: 50,
        activities: ['attack'],
      },
      {
        pass: 'rollFinished',
        macro: dismiss,
        priority: 50,
        activities: ['dismiss'],
      },
    ],
  },
  config: [
    {
      value: 'name',
      label: 'CHRISPREMADES.Summons.CustomName',
      i18nOption: 'CHRISPREMADES.Summons.CreatureNames.Echo',
      type: 'text',
      default: '',
      category: 'summons',
    },
    {
      value: 'token',
      label: 'CHRISPREMADES.Summons.CustomToken',
      i18nOption: 'CHRISPREMADES.Summons.CreatureNames.Echo',
      type: 'file',
      default: '',
      category: 'summons',
    },
    {
      value: 'avatar',
      label: 'CHRISPREMADES.Summons.CustomAvatar',
      i18nOption: 'CHRISPREMADES.Summons.CreatureNames.Echo',
      type: 'file',
      default: '',
      category: 'summons',
    },
    {
      value: 'filter',
      label: 'CHRISPREMADES.Config.ApplyFilter',
      type: 'checkbox',
      default: true,
      category: 'animation',
    },
    {
      value: 'animation',
      label: 'CHRISPREMADES.Config.SpecificAnimation',
      i18nOption: 'CHRISPREMADES.Summons.CreatureNames.Echo',
      type: 'select',
      default: 'smoke',
      category: 'animation',
      options: constants.summonAnimationOptions,
    },
    {
      value: 'playAnimation',
      label: 'CHRISPREMADES.Config.PlayTeleportAnimation',
      type: 'checkbox',
      default: true,
      category: 'animation',
    },
  ],
};

