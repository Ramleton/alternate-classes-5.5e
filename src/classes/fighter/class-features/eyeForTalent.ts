import type { Workflow } from '@midi-qol/types/module/Workflow';
import { activityUtils, dialogUtils, effectUtils, workflowUtils } from 'chrisPremades';

async function preApplyEyeForTalent({ workflow }: { workflow: Workflow }) {
  return workflow.hitTargets.size;
}

async function applyEyeForTalent({
  trigger: { entity: item },
  workflow,
}) {
  const effectData = {
    name: item.name,
    img: item.img,
    origin: item.uuid,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eEyeForTalentBonus',
        },
      },
    },
  };
  await effectUtils.createEffect(workflow.hitTargets.first().actor, effectData);
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
    'ac55eEyeForTalentBonus',
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
  if (!checkWorkflow.saves.size) return;
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
  const mappedAbilities = {
    cha: 'Charisma',
    con: 'Constitution',
    dex: 'Dexterity',
    int: 'Intelligence',
    str: 'Strength',
    wis: 'Wisdom',
  };
  if (selection === 'armorClass') {
    console.log('Armor Class', targetActor.system.attributes.ac.value);
    return;
  }
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
    console.log('Highest Ability Score', sortedAbilityScores[0].ability);
    return;
  }
  if (selection === 'lowestAbilityScore') {
    const lowestAbility = sortedAbilityScores[sortedAbilityScores.length - 1];
    console.log('Lowest Ability Score', lowestAbility.ability);
    return;
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
