import CPRMacro, { MidiMacroFunctionArgs } from 'chris-premades/macro.js';
import Activity from 'fvtt-types/Activity.js';

const getSortedAbilityScores = (targetActor: Actor5e, reverse = false) => {
  const targetAbilities: Record<string, { value: number }> =
    targetActor.system.abilities;
  const MAPPED_ABILITIES = {
    cha: 'Charisma',
    con: 'Constitution',
    dex: 'Dexterity',
    int: 'Intelligence',
    str: 'Strength',
    wis: 'Wisdom',
  } as const;
  const sortedAbilityScores = Object.entries(targetAbilities)
    .map(([k, v]) => ({
      ability: MAPPED_ABILITIES[k],
      ...v,
    }))
    .sort((a, b) => b.value - a.value);
  if (!reverse) return sortedAbilityScores;
  return sortedAbilityScores.reverse();
};

const DEFAULT_CHECK_OPTIONS: CheckOption[] = [
  {
    name: 'Armor Class',
    identifier: 'armorClass',
    handler: ({ referenceTarget, workflow }) => {
      const targetActor = workflow.targets.first()!.actor!;
      return `<p><b>Eye for Talent: ${referenceTarget} Armor Class:</b></p>\
        ${targetActor.system.attributes.ac.value}`;
    },
  },
  {
    name: 'Highest Ability Score',
    identifier: 'highestAbilityScore',
    handler: ({ referenceTarget, workflow }) => {
      const targetActor = workflow.targets.first()!.actor!;
      const sortedAbilityScores = getSortedAbilityScores(targetActor);
      return `<p><b>Eye for Talent: ${referenceTarget} Highest Ability Score:</b></p> ${sortedAbilityScores[0].ability}`;
    },
  },
  {
    name: 'Lowest Ability Score',
    identifier: 'lowestAbilityScore',
    handler: ({ referenceTarget, workflow }) => {
      const targetActor = workflow.targets.first()!.actor!;
      const sortedAbilityScores = getSortedAbilityScores(targetActor, true);
      return `<p><b>Eye for Talent: ${referenceTarget} Lowest Ability Score:</b></p> ${sortedAbilityScores[0].ability}`;
    },
  },
  {
    name: 'All Special Senses',
    identifier: 'allSpecialSenses',
    handler: ({ referenceTarget, workflow }) => {
      const targetActorSenses =
        workflow.targets.first()!.actor!.system.attributes.senses;
      const blindsight = targetActorSenses.ranges.blindsight;
      const darkvision = targetActorSenses.ranges.darkvision;
      const tremorsense = targetActorSenses.ranges.tremorsense;
      const truesight = targetActorSenses.ranges.truesight;
      const special = targetActorSenses.special;

      return `<p><b>Eye for Talent: ${referenceTarget} Special Senses:</b></p><ul>\
        ${blindsight ? `<li>Blindsight: ${blindsight} ft</li>` : ''}\
        ${darkvision ? `<li>Darkvision: ${darkvision} ft</li>` : ''}\
        ${tremorsense ? `<li>Tremorsense: ${tremorsense} ft</li>` : ''}\
        ${truesight ? `<li>Truesight: ${truesight} ft</li>` : ''}\
        ${special ? `<li>Other Senses: ${special}</li>` : ''}</ul>`;
    },
  },
  {
    name: 'Resistances, Immunities, & Vulnerabilities',
    identifier: 'resistancesImmunitiesVulnerabilities',
    handler: ({ referenceTarget, workflow }) => {
      const targetActorTraits = workflow.targets.first()!.actor!.system.traits;
      const resistances = [...targetActorTraits.dr.value].map(
        (r) => r[0].toUpperCase() + r.slice(1),
      );
      const resistanceMessage = `<p>${
        resistances.length
          ? `Resistances: ${[...resistances]}`
          : 'No Resistances'
      }</p>`;
      const immunities = [...targetActorTraits.di.value].map(
        (i) => i[0].toUpperCase() + i.slice(1),
      );
      const immunityMessage = `<p>${
        immunities.length ? `Immunities: ${[...immunities]}` : 'No Immunities'
      }</p>`;
      const vulnerabilities = [...targetActorTraits.dv.value].map(
        (v) => v[0].toUpperCase() + v.slice(1),
      );
      const vulnerabilityMessage = `<p>${
        vulnerabilities.length
          ? `Vulnerability: ${[...vulnerabilities]}`
          : 'No Vulnerabilities'
      }</p>`;

      return `<p><b>Eye for Talent: ${referenceTarget} Resistances, Immunities, & Vulnerabilities:</b></p><ul>\
        <li>${resistanceMessage}</li>\
        <li>${immunityMessage}</li>\
        <li>${vulnerabilityMessage}</li></ul>`;
    },
  },
  {
    name: 'One Trait or Action from its Stat Block',
    identifier: 'oneTraitOrAction',
    handler: ({ referenceTarget, workflow }) => {
      const targetActor = workflow.targets.first()!.actor!;
      const targetActorActions = targetActor.items.filter((i) => {
        if (!['feat', 'weapon'].includes(i.type)) return 'Error';
        const rawActivities = i.system?.activities as Activity[];
        const activities = rawActivities
          ? typeof rawActivities.values === 'function'
            ? Array.from(rawActivities.values())
            : Object.values(rawActivities)
          : [];

        return activities.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) =>
            ['action', 'bonus', 'reaction'].includes(a.activation?.type),
        );
      });
      const targetActorTraits = targetActor.items.filter((i) =>
        i.system.properties.has('trait'),
      );
      const actionsOrTraits = new Set([
        ...targetActorActions,
        ...targetActorTraits,
      ]);
      if (!actionsOrTraits.size) return 'Eye for Talent: No Actions or Traits';
      // Randomly get one of the actions or traits
      const randomActionOrTrait =
        Array.from(actionsOrTraits)[
          Math.floor(Math.random() * actionsOrTraits.size)
        ];

      return `<p><b>Eye for Talent: ${referenceTarget} Action or Trait:</b></p>\
      ${randomActionOrTrait.name}`;
    },
  },
] as const;

const getReference = (targetActor: Actor5e): string => {
  const endsWithS = targetActor.name.endsWith('s');
  const referenceTarget = endsWithS
    ? `${targetActor.name}'`
    : `${targetActor.name}'s`;
  return referenceTarget;
};

interface CheckOptionHandlerArgs extends MidiMacroFunctionArgs {
  referenceTarget: string;
}

interface CheckOption {
  name: string;
  identifier: string;
  handler: (args: CheckOptionHandlerArgs) => string;
}

interface WorkflowArgs extends MidiMacroFunctionArgs {
  preCheck?: (data: MidiMacroFunctionArgs) => Promise<void>;
  postCheck?: (data: PostCheckArgs) => Promise<void>;
  checkOptions?: CheckOption[];
}

type WorkflowFunction = (data: WorkflowArgs) => Promise<void>;

export const infoCheckWorkflow: WorkflowFunction = async ({
  trigger,
  workflow,
  preCheck = () => Promise.resolve(),
  postCheck = () => Promise.resolve(),
  checkOptions = DEFAULT_CHECK_OPTIONS,
}): Promise<void> => {
  if (!workflow.targets.size) return;
  const feat = trigger.entity as Item<'feat'>;
  const targetActor = workflow.targets.first()!.actor;
  if (!targetActor) return;
  const {
    utils: {
      activityUtils,
      dialogUtils,
      genericUtils,
      socketUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const checkActivity = activityUtils.getActivityByIdentifier(feat, 'search');
  if (!checkActivity) return;
  const newCheckActivity = genericUtils.duplicate(checkActivity.toObject());
  if (!newCheckActivity) return;
  const enemyLevel =
    'cr' in targetActor.system.details
      ? targetActor.system.details.cr
      : targetActor.system.details.level;
  const newDC = 8 + enemyLevel;
  newCheckActivity.check.dc.value = newDC;
  newCheckActivity.check.dc.formula = newDC;
  await preCheck({ trigger, workflow });
  const checkWorkflow = await workflowUtils.syntheticActivityDataRoll(
    newCheckActivity,
    workflow.item,
    workflow.actor,
    [workflow.token!],
  );
  if (!checkWorkflow) return;
  await postCheck({ trigger, workflow, success: !!checkWorkflow.saves.size });
  const options: [string, string][] = checkOptions.map((o) => [
    o.name,
    o.identifier,
  ]);
  const selection = await dialogUtils.buttonDialog(
    `${feat.name}: Success`,
    'Choose one of the following options:',
    options,
    {
      userId: socketUtils.firstOwner(feat.actor, true),
    },
  );
  if (!selection) return;
  const gmID = socketUtils.gmID();
  const message = checkOptions
    .find((o) => o.identifier === selection)!
    .handler({
      trigger,
      workflow,
      referenceTarget: getReference(targetActor),
    });
  await ChatMessage.create({
    user: gmID,
    content: message,
  });
};

interface PostCheckArgs extends MidiMacroFunctionArgs {
  success: boolean;
}

/**
 * preCheck - Runs before the Check Activity
 * postCheck - Runs after the Check Activity and is given whether the check was successful or not
 */
interface InfoCheckMacroFactoryArgs {
  identifier: string;
  name: string;
  version?: `${number}.${number}.${number}`;
  preCheck?: (data: MidiMacroFunctionArgs) => Promise<void>;
  postCheck?: (data: PostCheckArgs) => Promise<void>;
  checkOptions?: CheckOption[];
}

type InfoCheckMacroFactory = (args: InfoCheckMacroFactoryArgs) => CPRMacro;

const factory: InfoCheckMacroFactory = ({
  identifier,
  name,
  version = '1.0.0',
  preCheck = () => Promise.resolve(),
  postCheck = () => Promise.resolve(),
  checkOptions = DEFAULT_CHECK_OPTIONS,
}) => {
  const macro: CPRMacro = {
    identifier,
    name,
    source: 'Alternate Classes 5.5e',
    version,
    rules: 'modern',
    midi: {
      item: [
        {
          pass: 'rollFinished',
          macro: (data) =>
            infoCheckWorkflow({ ...data, preCheck, postCheck, checkOptions }),
          priority: 100,
          activities: ['use'],
        },
      ],
    },
  };
  return macro;
};

export default factory;
