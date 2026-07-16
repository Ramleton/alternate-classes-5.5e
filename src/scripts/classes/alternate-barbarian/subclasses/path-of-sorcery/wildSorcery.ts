import { getActivityData, runActivity } from 'automation/utils.js';
import { getMeleeWeapons } from 'automation/weaponUtils.js';
import CPRMacro, { D20Roll, MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { HealActivity, SaveActivity } from 'fvtt-types/Activity.js';
import { DamageType } from 'types/damage.js';
import { EffectData } from 'types/effects.js';

const WILD_SORCERY_TABLE_DIE = 'd12';

const TABLE_OPTIONS: [string, string][] = [
  ['1. Necrotic Rage Damage Bonus', '1'],
  ['2. Teleport Bonus Action', '2'],
  ['3. Raw Magic Explosion', '3'],
  ['4. Thrown Weapon Infusion', '4'],
  ['5. Reactionary Magic Attack', '5'],
  ['6. Mighty Leap at Will', '6'],
  ['7. Resistance to Last Damage', '7'],
  ['8. Enlarge', '8'],
  ['9. Blinding Light', '9'],
  ['10. Pass Through Solids', '10'],
  ['11. Magical Vines', '11'],
  ['12. Regain Rage and Reroll', '12'],
];

const rollWildSorceryTable = async (
  actor: Actor5e,
): Promise<[number] | [number, number]> => {
  const {
    utils: { rollUtils },
  } = chrisPremades;
  const numDice = actor.system.scale['path-of-sorcery'][
    'wild-sorcery-dice'
  ] as number;
  const res = (await rollUtils.rollDice(`${numDice}${WILD_SORCERY_TABLE_DIE}`, {
    chatMessage: true,
    flavor: 'Wild Sorcery Table',
  })) as { roll: D20Roll; message: ChatMessage };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (res.roll.dice[0] as any).results.map(
    (r: { result: number }) => r.result,
  );
};

const handleWildSorceryFour = async (
  actor: Actor5e,
  wildSorceryEffect: ActiveEffect,
): Promise<void> => {
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const feat = itemUtils.getItemByIdentifier(actor, 'ac55eWildSorcery') as
    Item<'feat'> | undefined;
  if (!feat) return;
  const meleeWeapons = getMeleeWeapons(actor);
  if (!meleeWeapons.length) return;
  const randomMeleeWeapon =
    meleeWeapons[Math.floor(Math.random() * meleeWeapons.length)];
  const enchant = itemUtils.getEffectByIdentifier(feat, 'ac55eWildSorceryFour');
  if (!enchant) return;
  await itemUtils.enchantItem(randomMeleeWeapon, enchant, {
    parentEntity: wildSorceryEffect,
  });
};

const createWildSorcerySevenEffect = async (
  actor: Actor5e,
  wildSorceryEffect: ActiveEffect,
) => {
  const {
    utils: { effectUtils, itemUtils },
  } = chrisPremades;
  const feat = itemUtils.getItemByIdentifier(actor, 'ac55eWildSorcery') as
    Item<'feat'> | undefined;
  if (!feat) return;
  const previousDamageType = feat.flags['alternate-classes-55e']
    .wildSorceryLastDamage as DamageType;
  const effectData: EffectData = {
    name: `Wild Sorcery: Resistance (${previousDamageType.capitalize()})`,
    icon: 'icons/magic/defensive/shield-barrier-flaming-pentagon-green.webp',
    duration: {},
    origin: wildSorceryEffect.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eWildSorcerySeven',
        },
      },
    },
    changes: [
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: previousDamageType,
        priority: 20,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(actor, effectData, {
    parentEntity: wildSorceryEffect,
  });
};

const createWildSorceryEightEffect = async (
  actor: Actor5e,
  wildSorceryEffect: ActiveEffect,
  rageEffect: ActiveEffect,
) => {
  const {
    utils: { actorUtils, dialogUtils, effectUtils, socketUtils, itemUtils },
  } = chrisPremades;
  const feat = itemUtils.getItemByIdentifier(actor, 'ac55eWildSorcery') as
    Item<'feat'> | undefined;
  if (!feat) return;
  const getNextSize = (): string => {
    const prevSize = actorUtils.getSize(actor, false);
    if (prevSize === 0) return 'small';
    if (prevSize === 1) return 'med';
    if (prevSize === 2) return 'lg';
    if (prevSize === 3) return 'huge';
    return 'grg';
  };
  const selection = await dialogUtils.confirm(
    'Wild Sorcery: Enlarged',
    `Is there enough space for ${actor.name} to grow?`,
    { userId: socketUtils.gmID() },
  );
  // If the GM says there isn't enough space, roll again
  if (!selection) return await handleRollWildSorceryTable(actor, rageEffect);
  const effectData: EffectData = {
    name: 'Wild Sorcery: Enlarged',
    icon: 'icons/magic/control/silhouette-grow-shrink-tan.webp',
    duration: {},
    origin: wildSorceryEffect.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eWildSorceryEight',
        },
      },
    },
    changes: [
      {
        key: 'system.traits.size',
        mode: 0,
        value: getNextSize(),
        priority: 20,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(actor, effectData, {
    parentEntity: wildSorceryEffect,
  });
};

const createWildSorceryNineEffect = async (
  actor: Actor5e,
  wildSorceryEffect: ActiveEffect,
) => {
  const {
    utils: { effectUtils, itemUtils },
  } = chrisPremades;
  const feat = itemUtils.getItemByIdentifier(actor, 'ac55eWildSorcery') as
    Item<'feat'> | undefined;
  if (!feat) return;
  const effectData: EffectData = {
    name: 'Wild Sorcery: Blinding Light',
    icon: 'icons/magic/light/explosion-star-glow-silhouette.webp',
    duration: {},
    origin: wildSorceryEffect.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eWildSorceryNine',
        },
      },
    },
    changes: [
      {
        key: 'ATL.light.bright',
        mode: 4,
        value: '15',
        priority: 20,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(actor, effectData, {
    parentEntity: wildSorceryEffect,
  });
};

const createWildSorceryElevenEffect = async (
  actor: Actor5e,
  wildSorceryEffect: ActiveEffect,
) => {
  const {
    utils: { effectUtils, itemUtils },
  } = chrisPremades;
  const feat = itemUtils.getItemByIdentifier(actor, 'ac55eWildSorcery') as
    Item<'feat'> | undefined;
  if (!feat) return;
  const effectData: EffectData = {
    name: 'Wild Sorcery: Mystical Flowers and Vines',
    icon: 'icons/magic/nature/root-vine-entangled-humanoid.webp',
    duration: {},
    origin: wildSorceryEffect.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eWildSorceryEleven',
        },
      },
    },
    changes: [],
    statuses: [],
  };
  await effectUtils.createEffect(actor, effectData, {
    parentEntity: wildSorceryEffect,
  });
};

const handleWildSorceryTwelve = async (
  actor: Actor5e,
  rageEffect: ActiveEffect,
) => {
  const {
    utils: { genericUtils, itemUtils },
  } = chrisPremades;
  const rageItem = itemUtils.getItemByIdentifier(actor, 'ac55eRage') as
    Item<'feat'> | undefined;
  if (!rageItem) return;
  await genericUtils.update(rageItem, {
    system: { uses: { spent: Math.max(0, rageItem.system.uses!.spent - 1) } },
  });
  await handleRollWildSorceryTable(actor, rageEffect);
};

export const handleRollWildSorceryTable = async (
  actor: Actor5e,
  rageEffect: ActiveEffect,
): Promise<void> => {
  const res = await rollWildSorceryTable(actor);
  const {
    utils: { dialogUtils, effectUtils, genericUtils, socketUtils },
  } = chrisPremades;
  await genericUtils.sleep(2000);
  let selection: number | undefined = undefined;
  if (res.length === 1 || res[0] === res[1]) {
    selection = res[0];
  } else {
    selection = Number(
      await dialogUtils.buttonDialog(
        'Wild Sorcery Table',
        'Select an option',
        res.map((r) => TABLE_OPTIONS[r - 1]),
        { userId: socketUtils.firstOwner(actor, true) },
      ),
    );
    if (!selection) return;
  }
  const sorceryName = TABLE_OPTIONS[selection - 1][0].split('.')[1].trim();
  const effectData: EffectData = {
    name: `Wild Sorcery: ${sorceryName}`,
    icon: 'icons/magic/control/encase-creature-humanoid-hold.webp',
    duration: {},
    origin: rageEffect.uuid!,
    flags: {
      'alternate-classes-55e': {
        macros: {
          wildSorcery: selection,
        },
      },
      dae: {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eWildSorceryEffect',
        },
      },
    },
    changes: [],
    statuses: [],
  };
  let wildSorceryEffect: ActiveEffect | undefined = undefined;
  if (selection !== 12) {
    wildSorceryEffect = await effectUtils.createEffect(actor, effectData, {
      parentEntity: rageEffect,
    });
  }
  if (selection === 4) await handleWildSorceryFour(actor, wildSorceryEffect!);
  if (selection === 7)
    await createWildSorcerySevenEffect(actor, wildSorceryEffect!);
  if (selection === 8)
    await createWildSorceryEightEffect(actor, wildSorceryEffect!, rageEffect);
  if (selection === 9)
    await createWildSorceryNineEffect(actor, wildSorceryEffect!);
  if (selection === 11)
    await createWildSorceryElevenEffect(actor, wildSorceryEffect!);
  if (selection === 12) await handleWildSorceryTwelve(actor, rageEffect);
};

export const getWildSorceryResult = (actor: Actor5e): number | undefined => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const wildSorceryEffect = effectUtils.getEffectByIdentifier(
    actor,
    'ac55eWildSorceryEffect',
  );
  return wildSorceryEffect?.flags?.['alternate-classes-55e']?.macros
    ?.wildSorcery;
};

const handleWildSorceryOne: MidiMacroFunction = async ({
  trigger: { entity, token },
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  if (!ditem || !ditem.totalDamage) return;
  if (getWildSorceryResult(feat.actor!) !== 1) return;
  const wildSorceryOneHealActivity = (await getActivityData(
    feat,
    'sorceryOne',
  )) as HealActivity | undefined;
  if (!wildSorceryOneHealActivity?.uses?.value) return;
  const totalNecroticDamage = ditem.damageDetail.reduce((acc, d) => {
    return d.type === 'necrotic' ? acc + d.damage : acc;
  }, 0);
  if (!totalNecroticDamage) return;
  wildSorceryOneHealActivity.healing.custom.formula = `${totalNecroticDamage}`;
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  await workflowUtils.syntheticActivityDataRoll(
    wildSorceryOneHealActivity,
    feat,
    feat.actor!,
    [token],
    { consumeResources: true },
  );
};

const handleWildSorceryTwo: MidiMacroFunction = async ({
  trigger: { token },
}) => {
  const { Teleport } = chrisPremades;
  await Teleport.target([token], token, { range: 30 });
};

const handleWildSorceryThree: MidiMacroFunction = async ({
  trigger: { entity },
}) => {
  const feat = entity as Item<'feat'>;
  const saveActivity = (await getActivityData(feat, 'sorceryThree')) as
    SaveActivity | undefined;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  if (!saveActivity) {
    return genericUtils.notify(
      `Missing save activity on ${feat.name} for Wild Sorcery 3`,
      'error',
    );
  }
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  saveActivity.damage.parts[0].custom.formula = `2${exploitDie}`;
  await workflowUtils.syntheticActivityDataRoll(
    saveActivity,
    feat,
    feat.actor!,
    [],
  );
};

const handleWildSorceryFive: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const {
    utils: { actorUtils, dialogUtils, socketUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  if (tokenUtils.getDistance(token, workflow.token!) > 30) return;
  if (!tokenUtils.canSee(token, workflow.token!)) return;
  const feat = entity as Item<'feat'>;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  const saveActivity = (await getActivityData(feat, 'sorceryFive')) as
    SaveActivity | undefined;
  if (!saveActivity) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    'Sorcery 5: Use your reaction to force your attacker to make a saving throw?',
    { userId },
  );
  if (!selection) return;
  saveActivity.damage.parts[0].custom.formula = `2${exploitDie}`;
  await workflowUtils.syntheticActivityDataRoll(
    saveActivity,
    feat,
    feat.actor!,
    [workflow.token!],
    { consumeResources: true },
  );
};

const handleWildSorceryNine: MidiMacroFunction = async ({
  trigger: { entity },
}) => {
  const feat = entity as Item<'feat'>;
  await runActivity(feat, 'sorceryNine', []);
};

const handleUseWildSorcery: MidiMacroFunction = async (data) => {
  const feat = data.trigger.entity as Item<'feat'>;
  const wildSorceryRes = getWildSorceryResult(feat.actor!);
  if (wildSorceryRes === 2) return await handleWildSorceryTwo(data);
  if (wildSorceryRes === 3) return await handleWildSorceryThree(data);
  if (wildSorceryRes === 9) return await handleWildSorceryNine(data);
  const {
    utils: { genericUtils },
  } = chrisPremades;
  return genericUtils.notify(
    'The 2nd effect on the Wild Sorcery table is not active',
    'warn',
  );
};

const trackLastDamage: MidiMacroFunction = async ({
  trigger: { entity },
  ditem,
}) => {
  if (!ditem || !ditem.totalDamage) return;
  const feat = entity as Item<'feat'>;
  const lastDamageType = ditem.damageDetail[0].type;
  feat.flags['alternate-classes-55e'].wildSorceryLastDamage = lastDamageType;
  const {
    utils: { effectUtils, genericUtils },
  } = chrisPremades;
  const resistanceEffect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eWildSorcerySeven',
  );
  if (!resistanceEffect) return;
  await genericUtils.update(resistanceEffect, {
    changes: [
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: lastDamageType,
        priority: 20,
      },
    ],
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eWildSorcery',
  name: 'Path Of Sorcery: Wild Sorcery',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: handleWildSorceryFive,
        priority: 100,
      },
      {
        pass: 'targetApplyDamage',
        macro: trackLastDamage,
        priority: 900,
      },
      {
        pass: 'rollFinished',
        macro: handleWildSorceryOne,
        priority: 500,
      },
    ],
    item: [
      {
        pass: 'rollFinished',
        macro: handleUseWildSorcery,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
