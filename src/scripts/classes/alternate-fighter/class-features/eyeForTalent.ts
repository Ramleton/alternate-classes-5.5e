import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const preApply = async (
  { workflow }: { workflow: Workflow },
): Promise<boolean> => {
  return !!workflow.hitTargets.size;
};
const apply = async ({
  trigger: { entity: item },
  workflow,
}: {
  trigger: { entity: Item<'feat'> };
  workflow: Workflow;
}): Promise<boolean> => {
  const targetActor = workflow.hitTargets.first()!.actor;
  if (!targetActor)
    return false;
  const { utils: { effectUtils } } = chrisPremades;
  const hitEffect = effectUtils.getEffectByIdentifier(
    targetActor,
    `ac55eEyeForTalentBonus|${workflow.actor.id}`,
  );
  if (hitEffect)
    await hitEffect.delete();
  const effectData = {
    name: `Eye for Talent: Bonus`,
    img: item.img,
    origin: item.uuid,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        info: {
          identifier: `ac55eEyeForTalentBonus|${workflow.actor.id}`,
        },
      },
    },
  };
  await effectUtils.createEffect(targetActor, effectData);
  const failEffect = effectUtils.getEffectByIdentifier(
    targetActor,
    `ac55eEyeForTalentFail|${workflow.actor.id}`,
  );
  if (failEffect)
    await failEffect.delete();
  return true;
};
const applyWorkflow: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}): Promise<void> => {
  const feat = item as Item<'feat'>;
  const res1 = await preApply({ workflow });
  if (!res1)
    return;
  await apply({
    trigger: { entity: feat },
    workflow,
  });
};
const pre = async ({ workflow }: { workflow: Workflow }): Promise<boolean> => {
  return !!workflow.targets.size;
};
const during = async ({
  trigger: { entity: item },
  workflow,
}: {
  trigger: { entity: Item<'feat'> };
  workflow: Workflow;
}): Promise<void> => {
  const targetActor = workflow.targets.first()!.actor;
  if (!targetActor)
    return;
  const { utils: {
    activityUtils,
    effectUtils,
    dialogUtils,
    genericUtils,
    socketUtils,
    workflowUtils,
  } } = chrisPremades;
  const effect = await effectUtils.getEffectByIdentifier(
    targetActor,
    `ac55eEyeForTalentBonus|${workflow.actor.id}`,
  );
  const checkActivity = activityUtils.getActivityByIdentifier(item, 'search');
  if (!checkActivity)
    return;
  const newCheckActivity = genericUtils.duplicate(checkActivity.toObject());
  if (!newCheckActivity)
    return;
  const enemyCR = targetActor.system.details.cr;
  const newDC = 8 + enemyCR;
  newCheckActivity.check.dc.value = newDC;
  newCheckActivity.check.dc.formula = newDC;
  console.log('Check Activity', newCheckActivity);
  let bonusEffect;
  if (effect) {
    const effectData = {
      name: 'Eye for Talent: Bonus',
      img: item.img,
      origin: item.uuid,
      duration: { seconds: 1 },
      flags: {
        'chris-premades': {
          info: {
            identifier: 'ac55eEyeForTalentBonus',
          },
        },
      },
      changes: [
        {
          key: 'flags.automated-conditions-5e.check.bonus',
          mode: 2,
          value: 'bonus=@classes.alternate-fighter.levels;',
          priority: 20,
        },
      ],
    };
    bonusEffect = await effectUtils.createEffect(workflow.actor, effectData);
  }
  const checkWorkflow = await workflowUtils.syntheticActivityDataRoll(
    newCheckActivity,
    workflow.item,
    workflow.actor,
    [workflow.token!],
  );
  if (bonusEffect) {
    bonusEffect.delete();
  }
  if (!checkWorkflow)
    return;
  if (!checkWorkflow.saves.size) {
    const failEffectData = {
      name: 'Eye for Talent: Fail',
      img: item.img,
      origin: item.uuid,
      duration: {},
      flags: {
        'chris-premades': {
          info: {
            identifier: `ac55eEyeForTalentFail|${workflow.actor.id}`,
          },
        },
        'dae': {
          specialDuration: ['longRest'],
        },
      },
    };
    await effectUtils.createEffect(targetActor, failEffectData);
    return;
  }
  const options: [string, string][] = [
    ['Armor Class', 'armorClass'],
    ['Highest Ability Score', 'highestAbilityScore'],
    ['All Special Senses', 'allSpecialSenses'],
    ['Lowest Ability Score', 'lowestAbilityScore'],
    [
      'Resistances, Immunities, & Vulnerabilities',
      'resistancesImmunitiesVulnerabilities',
    ],
    ['One Trait or Action from its Stat Block', 'oneTraitOrAction'],
  ];
  const selection = await dialogUtils.buttonDialog(
    'Eye for Talent: Success',
    'Choose one of the following options:',
    options, {
      userId: socketUtils.firstOwner(item.actor, true),
    });
  if (!selection)
    return;
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
  const targetAbilities: Record<string, { value: number }>
    = targetActor.system.abilities;
  const sortedAbilityScores = Object
    .entries(targetAbilities)
    .map(([k, v]) => ({
      ability: mappedAbilities[k],
      ...v,
    }))
    .sort((a, b) => b.value - a.value);
  if (selection === 'highestAbilityScore') {
    await ChatMessage.create({
      user: gmID,
      // eslint-disable-next-line @stylistic/max-len
      content: `<p><b>Eye for Talent: ${referenceTarget} Highest Ability Score:</b></p>\
        ${sortedAbilityScores[0].ability}`,
    });
    return;
  }
  if (selection === 'lowestAbilityScore') {
    await ChatMessage.create({
      user: gmID,
      // eslint-disable-next-line @stylistic/max-len
      content: `<p><b>Eye for Talent: ${referenceTarget} Lowest Ability Score:</b></p>\
        ${sortedAbilityScores[sortedAbilityScores.length - 1].ability}`,
    });
    return;
  }
  if (selection === 'allSpecialSenses') {
    const blindsight = targetActor.system.attributes.senses.ranges.blindsight;
    const darkvision = targetActor.system.attributes.senses.ranges.darkvision;
    const tremorsense = targetActor.system.attributes.senses.ranges.tremorsense;
    const truesight = targetActor.system.attributes.senses.ranges.truesight;
    const special = targetActor.system.attributes.senses.special;
    // eslint-disable-next-line @stylistic/max-len
    const message = `<p><b>Eye for Talent: ${referenceTarget} Special Senses:</b></p><ul>\
      ${blindsight ? `<li>Blindsight: ${blindsight} ft</li>` : ''}\
      ${darkvision ? `<li>Darkvision: ${darkvision} ft</li>` : ''}\
      ${tremorsense ? `<li>Tremorsense: ${tremorsense} ft</li>` : ''}\
      ${truesight ? `<li>Truesight: ${truesight} ft</li>` : ''}\
      ${special ? `<li>Other Senses: ${special}</li>` : ''}</ul>`;
    await ChatMessage.create({
      user: gmID,
      content: message,
    });
    return;
  }
  if (selection === 'resistancesImmunitiesVulnerabilities') {
    const resistances = [...targetActor.system.traits.dr.value].map(r =>
      r[0].toUpperCase() + r.slice(1),
    );
    const resistanceMessage = `<p>${resistances.length
      ? `Resistances: ${[...resistances]}`
      : 'No Resistances'}</p>`;
    const immunities = [...targetActor.system.traits.di.value].map(i =>
      i[0].toUpperCase() + i.slice(1),
    );
    const immunityMessage = `<p>${immunities.length
      ? `Immunities: ${[...immunities]}`
      : 'No Immunities'}</p>`;
    const vulnerabilities = [...targetActor.system.traits.dv.value].map(v =>
      v[0].toUpperCase() + v.slice(1),
    );
    const vulnerabilityMessage = `<p>${vulnerabilities.length
      ? `Vulnerability: ${[...vulnerabilities]}`
      : 'No Vulnerabilities'}</p>`;
    // eslint-disable-next-line @stylistic/max-len
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
  else {
    const targetActorActions = targetActor.items.filter((i) => {
      if (!['feat', 'weapon'].includes(i.type))
        return false;
      const rawActivities = i.system?.activities;
      const activities = rawActivities
        ? (typeof rawActivities.values === 'function'
            ? Array.from(rawActivities.values())
            : Object.values(rawActivities))
        : [];

      return activities.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => ['action', 'bonus', 'reaction']
          .includes(a.activation?.type),
      );
    });
    const targetActorTraits = targetActor.items.filter((i) => {
      const properties = i.system.properties || [];
      return properties.has('trait');
    });
    const actionsOrTraits = new Set([
      ...targetActorActions,
      ...targetActorTraits,
    ]);
    if (!actionsOrTraits.size)
      return;
    // Randomly get one of the actions or traits
    const randomActionOrTrait = Array.from(actionsOrTraits)[
      Math.floor(Math.random() * actionsOrTraits.size)
    ];
    // eslint-disable-next-line @stylistic/max-len
    const message = `<p><b>Eye for Talent: ${referenceTarget} Action or Trait:</b></p>\
      ${randomActionOrTrait.name}`;
    await ChatMessage.create({
      user: gmID,
      content: message,
    });
  }
};
async function workflow({ trigger: { entity: item }, workflow }) {
  const res = pre({ workflow });
  if (!res)
    return;
  await during({
    trigger: { entity: item },
    workflow,
  });
}

const macro: CPRMacro = {
  identifier: 'ac55eEyeForTalent',
  name: 'Eye for Talent',
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
    ],
    item: [
      {
        pass: 'rollFinished',
        macro: workflow,
        priority: 50,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
