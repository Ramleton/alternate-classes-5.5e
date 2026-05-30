import type { Workflow } from '@midi-qol/types/module/Workflow';
import {
  activityUtils,
  dialogUtils,
  effectUtils,
  genericUtils,
  workflowUtils,
} from 'chrisPremades';

async function preApplyEyeForTalent({ workflow }: { workflow: Workflow }) {
  return workflow.hitTargets.size;
}

async function applyEyeForTalent({
  trigger: { entity: item },
  workflow,
}) {
  const targetActor = workflow.hitTargets.first().actor;
  const hitEffect = effectUtils.getEffectByIdentifier(
    targetActor,
    `ac55eEyeForTalentBonus|${workflow.actor.id}`,
  );
  if (hitEffect) await hitEffect.delete();
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
  if (failEffect) await failEffect.delete();
  return true;
}

async function applyEyeForTalentWorkflow({
  trigger: { entity: item },
  workflow,
}) {
  const res1 = await preApplyEyeForTalent({ workflow });
  if (!res1) return;
  await applyEyeForTalent({
    trigger: { entity: item },
    workflow,
  });
}

function preEyeForTalent({
  workflow,
}: {
  workflow: Workflow;
}) {
  return workflow.targets.size;
}

async function eyeForTalent({
  trigger: { entity: item },
  workflow,
}) {
  const targetActor = workflow.targets.first().actor;
  const effect = await effectUtils.getEffectByIdentifier(
    targetActor,
    `ac55eEyeForTalentBonus|${workflow.actor.id}`,
  );
  const checkActivity = activityUtils.getActivityByIdentifier(
    item,
    'search',
  );
  if (!checkActivity) return;
  const newCheckActivity = genericUtils.duplicate(checkActivity.toObject());
  if (!newCheckActivity) return;
  const enemyCR: number = targetActor.system.details.cr;
  const newDC = 8 + enemyCR;
  newCheckActivity.check.dc.value = newDC;
  newCheckActivity.check.dc.formula = newDC;
  console.log('Check Activity', newCheckActivity);
  let bonusEffect: ActiveEffect | null = null;
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
    [workflow.token],
  );
  if (bonusEffect) {
    bonusEffect.delete();
  }
  if (!checkWorkflow) return;
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
    options,
    {
      userId: socketUtils.firstOwner(item.actor, true),
    },
  );
  if (!selection) return;
  const endsWithS = targetActor.name.endsWith('s');
  const referenceTarget = endsWithS
    ? `${targetActor.name}'`
    : `${targetActor.name}'s`;
  const gmID = socketUtils.gmID();
  if (selection === 'armorClass') {
    return ChatMessage.create({
      user: gmID,
      content: `Eye for Talent: ${referenceTarget} Armor Class: \
        ${targetActor.system.attributes.ac.value}`,
    });
  }
  const mappedAbilities = {
    cha: 'Charisma',
    con: 'Constitution',
    dex: 'Dexterity',
    int: 'Intelligence',
    str: 'Strength',
    wis: 'Wisdom',
  };
  const targetAbilities: Record<
    string,
    {
      bonuses: { check: string; save: string };
      check: { roll: { max: number | null; min: number | null; mode: 0 } };
      max: number | null;
      proficient: 0 | 0.5 | 1 | 2;
      save: { roll: { max: number | null; min: number | null; mode: 0 } };
      value: number;
    }> = targetActor.system.abilities;
  const sortedAbilityScores = Object
    .entries(targetAbilities)
    .map(([k, v]) => ({
      ability: mappedAbilities[k],
      ...v,
    }))
    .sort((a, b) => b.value - a.value);
  if (selection === 'highestAbilityScore') {
    return ChatMessage.create({
      user: gmID,
      content: `Eye for Talent: ${referenceTarget} Highest Ability Score: \
        ${sortedAbilityScores[0].ability}`,
    });
  }
  if (selection === 'lowestAbilityScore') {
    return ChatMessage.create({
      user: gmID,
      content: `Eye for Talent: ${referenceTarget} Lowest Ability Score: \
        ${sortedAbilityScores[sortedAbilityScores.length - 1].ability}`,
    });
  }
  if (selection === 'allSpecialSenses') {
    const blindsight = targetActor.system.attributes.senses.ranges.blindsight;
    const darkvision = targetActor.system.attributes.senses.ranges.darkvision;
    const tremorsense = targetActor.system.attributes.senses.ranges.tremorsense;
    const truesight = targetActor.system.attributes.senses.ranges.truesight;
    const special = targetActor.system.attributes.senses.special;
    const message = `Eye for Talent: ${referenceTarget} Special Senses:\ 
      Blindsight: ${blindsight} ft, \
      Darkvision: ${darkvision} ft, \
      Tremorsense: ${tremorsense} ft, \
      Truesight: ${truesight} ft, \
      Other senses: ${special}`;
    return ChatMessage.create({
      user: gmID,
      content: message,
    });
  }
  if (selection === 'resistancesImmunitiesVulnerabilities') {
    const resistances = targetActor.system.traits.dr.value;
    const immunities = targetActor.system.traits.di.value;
    const vulnerabilities = targetActor.system.traits.dv.value;
    const message = `Eye for Talent: ${referenceTarget} Resistances, \
      Immunities, & Vulnerabilities:\ 
      Resistances: ${resistances}, \
      Immunities: ${immunities}, \
      Vulnerabilities: ${vulnerabilities}`;
    return ChatMessage.create({
      user: gmID,
      content: message,
    });
  }
  else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetActorActions = targetActor.items.filter((i: any) => {
      if (!['feat', 'weapon'].includes(i.type)) return false;

      const rawActivities = i.system?.activities;

      const activities = rawActivities
        ? (typeof rawActivities.values === 'function'
            ? Array.from(rawActivities.values())
            : Object.values(rawActivities)
          )
        : [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return activities.some((a: any) =>
        ['action', 'bonus', 'reaction'].includes(a.activation?.type),
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
    if (!actionsOrTraits.size) return;
    // Randomly get one of the actions or traits
    const randomActionOrTrait = Array.from(actionsOrTraits)[
      Math.floor(Math.random() * actionsOrTraits.size)
    ];
    const message = `Eye for Talent: ${referenceTarget} Action or Trait: \
      ${randomActionOrTrait.name}`;
    return ChatMessage.create({
      user: gmID,
      content: message,
    });
  }
}

async function eyeForTalentWorkflow({
  trigger: { entity: item },
  workflow,
}) {
  const res = preEyeForTalent({ workflow });
  if (!res) return;
  await eyeForTalent({
    trigger: { entity: item },
    workflow,
  });
}

export const ac55eEyeForTalent = {
  name: 'Eye for Talent',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: applyEyeForTalentWorkflow,
        priority: 100,
      },
    ],
    item: [
      {
        pass: 'rollFinished',
        macro: eyeForTalentWorkflow,
        priority: 50,
        activities: ['use'],
      },
    ],
  },
};
