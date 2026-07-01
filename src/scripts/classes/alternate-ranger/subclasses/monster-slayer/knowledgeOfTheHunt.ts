import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { CheckActivity } from 'fvtt-types/Activity.js';
import { CreatureType, NPCData } from 'fvtt-types/ConfiguredActor.js';
import { EffectData } from 'types/effects.js';
import { getQuarryDie, isQuarry } from '../../utils/quarryUtils.js';

const getSkill = (
  creatureType: CreatureType,
): 'arc' | 'his' | 'nat' | 'rel' => {
  switch (creatureType) {
    case 'aberration':
    case 'dragon':
    case 'monstrosity':
    case 'construct':
      return 'arc';
    case 'beast':
    case 'elemental':
    case 'ooze':
    case 'plant':
      return 'nat';
    case 'celestial':
    case 'fey':
    case 'fiend':
    case 'undead':
      return 'rel';
    default:
      return 'his';
  }
};

const use: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.targets.size) return;
  const target = workflow.targets.first() as Token;
  const targetActor = target.actor!;
  const feat = entity as Item<'feat'>;
  const {
    utils: {
      dialogUtils,
      effectUtils,
      genericUtils,
      rollUtils,
      socketUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (
    effectUtils.getEffectByIdentifier(
      targetActor,
      'ac55eKnowledgeOfTheHuntEffect',
    )
  ) {
    genericUtils.notify(
      `${feat.name}: Failed check against target, you must hit it with an attack to use this feature again`,
      'warn',
    );
    return;
  }
  if (typeof targetActor.system.details.type.value !== 'string') {
    genericUtils.notify(`${feat.name}: Unknown creature type`, 'warn');
    return;
  }
  const skill = getSkill(targetActor.system.details.type.value as CreatureType);
  const checkActivityData = (await getActivityData(feat, 'check')) as
    CheckActivity | undefined;
  if (!checkActivityData) return;
  checkActivityData.check.associated = new Set([skill]);
  checkActivityData.check.dc.formula = `8 + ${(targetActor.system as NPCData).details.cr}`;
  if (isQuarry(feat.actor!, targetActor)) {
    const quarryDie = getQuarryDie(feat.actor!);
    const roll = await rollUtils.rollDice(`1${quarryDie}`, {
      chatMessage: true,
    });
    await genericUtils.sleep(1500);
    checkActivityData.check.dc.formula += `- ${roll.roll.total}`;
  }
  const checkWorkflow: Workflow = await workflowUtils.syntheticActivityDataRoll(
    checkActivityData,
    feat,
    feat.actor!,
    [],
  );
  if (!checkWorkflow.saves.size) {
    const effectData: EffectData = {
      name: `${feat.name}: Failed Check`,
      icon: feat.img!,
      duration: {},
      origin: feat.uuid!,
      flags: {
        'chris-premades': {
          info: {
            identifier: 'ac55eKnowledgeOfTheHuntEffect',
          },
        },
      },
      changes: [],
      statuses: [],
    };
    await effectUtils.createEffect(targetActor, effectData, {});
    return;
  }
  const options: [string, string][] = [
    ['Armor Class', 'armorClass'],
    ['Highest Ability Score', 'highestAbilityScore'],
    ['Lowest Ability Score', 'lowestAbilityScore'],
    [
      'Resistances, Immunities, & Vulnerabilities',
      'resistancesImmunitiesVulnerabilities',
    ],
  ];
  const targetActorTraits = targetActor.items.filter((i) => {
    const properties = new Set(i.system.properties ?? []);
    return properties.has('trait');
  });
  if (targetActorTraits.length)
    options.push(['One Trait from its Stat Block', 'oneTrait']);
  const selection = await dialogUtils.buttonDialog(
    `${feat.name}`,
    'Choose one of the following options:',
    options,
    {
      userId: socketUtils.firstOwner(feat.actor, true),
    },
  );
  if (!selection) return;
  const endsWithS = targetActor.name.endsWith('s');
  const referenceTarget = endsWithS
    ? `${targetActor.name}'`
    : `${targetActor.name}'s`;
  const gmID = socketUtils.gmID();
  if (selection === 'armorClass') {
    await ChatMessage.create({
      user: gmID,
      content: `<p><b>Eye for Talent: ${referenceTarget} Armor Class:</b></p>\
          ${targetActor.system.attributes.ac.value}`,
    });
    return;
  }
  const mappedAbilities = {
    cha: 'Charisma',
    con: 'Constitution',
    dex: 'Dexterity',
    int: 'Intelligence',
    str: 'Strength',
    wis: 'Wisdom',
  };
  const targetAbilities: Record<string, { value: number }> =
    targetActor.system.abilities;
  const sortedAbilityScores = Object.entries(targetAbilities)
    .map(([k, v]) => ({
      ability: mappedAbilities[k],
      ...v,
    }))
    .sort((a, b) => b.value - a.value);
  if (selection === 'highestAbilityScore') {
    await ChatMessage.create({
      user: gmID,

      content: `<p><b>Eye for Talent: ${referenceTarget} Highest Ability Score:</b></p>\
          ${sortedAbilityScores[0].ability}`,
    });
    return;
  }
  if (selection === 'lowestAbilityScore') {
    await ChatMessage.create({
      user: gmID,

      content: `<p><b>Eye for Talent: ${referenceTarget} Lowest Ability Score:</b></p>\
          ${sortedAbilityScores[sortedAbilityScores.length - 1].ability}`,
    });
    return;
  }
  if (selection === 'resistancesImmunitiesVulnerabilities') {
    const resistances = [...targetActor.system.traits.dr.value].map(
      (r) => r[0].toUpperCase() + r.slice(1),
    );
    const resistanceMessage = `<p>${
      resistances.length ? `Resistances: ${[...resistances]}` : 'No Resistances'
    }</p>`;
    const immunities = [...targetActor.system.traits.di.value].map(
      (i) => i[0].toUpperCase() + i.slice(1),
    );
    const immunityMessage = `<p>${
      immunities.length ? `Immunities: ${[...immunities]}` : 'No Immunities'
    }</p>`;
    const vulnerabilities = [...targetActor.system.traits.dv.value].map(
      (v) => v[0].toUpperCase() + v.slice(1),
    );
    const vulnerabilityMessage = `<p>${
      vulnerabilities.length
        ? `Vulnerability: ${[...vulnerabilities]}`
        : 'No Vulnerabilities'
    }</p>`;

    const message = `<p><b>Eye for Talent: ${referenceTarget} Resistances, Immunities, & Vulnerabilities:</b></p><ul>\
      <li>${resistanceMessage}</li>\
      <li>${immunityMessage}</li>\
      <li>${vulnerabilityMessage}</li></ul>`;
    await ChatMessage.create({
      user: gmID,
      content: message,
    });
    return;
  }
  const randomTrait =
    Array.from(targetActorTraits)[
      Math.floor(Math.random() * targetActorTraits.length)
    ];

  const message = `<p><b>Eye for Talent: ${referenceTarget} Trait:</b></p>\
        ${randomTrait.name}`;
  await ChatMessage.create({
    user: gmID,
    content: message,
  });
};

const removeEffectOnHit: MidiMacroFunction = async ({ workflow }) => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  if (!workflow.hitTargets.size) return;
  const target = workflow.hitTargets.first() as Token;
  const targetActor = target.actor;
  if (!targetActor) return;
  const effect = effectUtils.getEffectByIdentifier(
    targetActor,
    'ac55eKnowledgeOfTheHuntEffect',
  );
  if (!effect) return;
  await effect.delete();
};

const macro: CPRMacro = {
  identifier: 'ac55eKnowledgeOfTheHunt',
  name: 'Monster Slayer: Knowledge Of The Hunt',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: removeEffectOnHit,
        priority: 100,
      },
    ],
    item: [
      {
        pass: 'rollFinished',
        macro: use,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
