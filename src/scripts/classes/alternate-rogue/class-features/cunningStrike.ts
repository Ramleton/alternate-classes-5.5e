import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { infoCheckWorkflow } from 'automation/infoCheckMacroFactory.js';
import { runActivity } from 'automation/utils.js';
import {
  ExploitPrerequisiteCheck,
  isWeaponAttack,
  meleeWeaponAttackHitCheck,
  meleeWeaponAttackRedirectCheck,
  weaponAttackHitCheck,
} from 'automation/weaponUtils.js';
import {
  getWorkflowProperty,
  setWorkflowProperty,
} from 'automation/workflowUtils.js';
import CPRMacro from 'chris-premades/macro.js';
import { genericARCWorkflow } from 'exploits/handling/genericARCExploit.js';
import { useWorkflow } from 'exploits/handling/genericUseExploit.js';
import { getAltMartialExploitsRemaining } from 'exploits/utils.js';
import { handleMindRend } from '../subclasses/psiknife/empoweredBlades.js';
import { handlePanache } from '../subclasses/swashbuckler/panache.js';
import {
  AutoExploitType,
  ExploitData,
  PromptFunction,
  SubclassFeatureCunningStrikeData,
} from '../types/cunningStrike.js';
import {
  qualifiesForSneakAttack,
  reduceSneakAttack,
} from '../utils/sneakAttackUtils.js';

const getExploitData = (
  prerequisiteCheck: ExploitPrerequisiteCheck,
  autoExploitType: AutoExploitType,
  sneakAttackDiceCost: number,
): ExploitData => {
  let handler = genericARCWorkflow;
  if (autoExploitType === 'PAR') handler = useWorkflow;
  return {
    prerequisiteCheck,
    handler,
    sneakAttackDiceCost,
  };
};

const PAR_DEVIOUS_EXPLOITS: Record<string, ExploitData> = {
  ac55ePrecisionStrikeExploit: getExploitData(isWeaponAttack, 'PAR', 1),
};

const ARC_DEVIOUS_EXPLOITS: Record<string, ExploitData> = {
  ac55eArrestingStrikeExploit: getExploitData(weaponAttackHitCheck, 'ARC', 1),
  ac55eDisarmExploit: getExploitData(meleeWeaponAttackHitCheck, 'ARC', 1),
  ac55eSweepingStrikeExploit: getExploitData(
    meleeWeaponAttackHitCheck,
    'ARC',
    1,
  ),
  ac55eCripplingStrikeExploit: getExploitData(
    meleeWeaponAttackHitCheck,
    'ARC',
    2,
  ),
  ac55eDirtyHitExploit: getExploitData(meleeWeaponAttackHitCheck, 'ARC', 2),
  ac55eExposingStrikeExploit: getExploitData(weaponAttackHitCheck, 'ARC', 2),
  ac55eGlancingBlowExploit: getExploitData(
    meleeWeaponAttackRedirectCheck,
    'ARC',
    2,
  ),
};

const SUBCLASS_FEATURE_CUNNING_STRIKES: SubclassFeatureCunningStrikeData[] = [
  {
    identifier: 'ac55eDeadlyBlades',
    preCheck: () => Promise.resolve(true),
    handler: async ({ selectedFeature, target }) => {
      await runActivity(selectedFeature, 'save', [target]);
    },
    sneakAttackDiceCost: 1,
  },
  {
    identifier: 'ac55eSupremeSneak',
    preCheck: () => Promise.resolve(true),
    handler: async () => {
      /* empty */
    },
    sneakAttackDiceCost: 1,
  },
  {
    identifier: 'ac55eInsightfulStrike',
    preCheck: () => Promise.resolve(true),
    handler: async ({ trigger, workflow }) => {
      await infoCheckWorkflow({ trigger, workflow });
    },
    sneakAttackDiceCost: 1,
  },
  {
    identifier: 'ac55eEmpoweredBlades',
    preCheck: ({ workflow }) =>
      Promise.resolve(
        workflow.item.flags['chris-premades']?.info?.identifier ===
          'ac55ePsiBladeItem',
      ),
    handler: async ({ trigger, workflow, selectedFeature, target }) => {
      await handleMindRend({ trigger, workflow, selectedFeature, target });
    },
    sneakAttackDiceCost: 2,
  },
  {
    identifier: 'ac55ePanache',
    preCheck: () => Promise.resolve(true),
    handler: async (data) => {
      await handlePanache(data);
    },
    sneakAttackDiceCost: 1,
  },
] as const;

const checkExploitUsable = (
  feat: Item<'feat'>,
  token: Token,
  workflow: Workflow,
  exploitHandler: ExploitPrerequisiteCheck,
): boolean => {
  // ? Remove exploits that cannot be used by the actor
  if (!getAltMartialExploitsRemaining(feat)) return false;
  return exploitHandler({ feat, token, workflow });
};

const pre = (feat: Item<'feat'>, token: Token, workflow: Workflow): boolean => {
  if (!feat.actor) return false;
  const altClasses55eFlags = feat.actor.flags['alternate-classes-55e'];
  if (altClasses55eFlags?.macros?.exploit?.used) return false;
  if (getWorkflowProperty(workflow, feat.actor, 'cunningStrike')) return false;
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const sneakAttack = itemUtils.getItemByIdentifier(
    feat.actor,
    'ac55eSneakAttack',
  ) as Item<'feat'>;
  if (!qualifiesForSneakAttack(sneakAttack, token, workflow)) return false;
  return true;
};

const isSubclassFeatureData = (
  opt: Item<'feat'> | SubclassFeatureCunningStrikeData,
): opt is SubclassFeatureCunningStrikeData => {
  return 'sneakAttackDiceCost' in opt && 'preCheck' in opt;
};

const prompt: PromptFunction = async ({
  trigger,
  workflow,
  deviousExploits,
}) => {
  const { entity, token } = trigger;
  const feat = entity as Item<'feat'>;
  if (!pre(feat, token, workflow)) return;
  const {
    utils: { dialogUtils, itemUtils, socketUtils },
  } = chrisPremades;
  // Check for usable devious exploits
  const usableDeviousExploits = Object.keys(deviousExploits)
    .filter((i) =>
      checkExploitUsable(
        feat,
        token,
        workflow,
        deviousExploits[i].prerequisiteCheck,
      ),
    )
    .map((i) => itemUtils.getItemByIdentifier(feat.actor!, i))
    .filter(Boolean)
    .map((i) => i as Item<'feat'>)
    .filter((i) => i.system.type.subtype === 'deviousExploit');
  const allUsableOptions: (Item<'feat'> | SubclassFeatureCunningStrikeData)[] =
    [...usableDeviousExploits];
  for (const subclassFeatureStrike of SUBCLASS_FEATURE_CUNNING_STRIKES) {
    const subclassFeature = itemUtils.getItemByIdentifier(
      feat.actor!,
      subclassFeatureStrike.identifier,
    ) as Item<'feat'> | undefined;
    if (subclassFeature) {
      const usable = await subclassFeatureStrike.preCheck({
        trigger,
        workflow,
      });
      if (usable) allUsableOptions.push(subclassFeatureStrike);
    }
  }
  if (!allUsableOptions.length) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  let message: string;
  switch (deviousExploits) {
    case PAR_DEVIOUS_EXPLOITS:
      message = 'Post Attack Roll: Use Cunning Strike?';
      break;
    default:
      message = 'Attack Roll Complete: Use Cunning Strike?';
  }
  const selection = await dialogUtils.confirm(feat.name, message, { userId });
  if (!selection) return;
  let selectedOption:
    Item<'feat'> | SubclassFeatureCunningStrikeData | undefined;
  if (allUsableOptions.length === 1) {
    selectedOption = allUsableOptions[0];
  } else {
    const buttons: [string, string][] = allUsableOptions.map((opt) => [
      'name' in opt
        ? opt.name
        : itemUtils.getItemByIdentifier(feat.actor!, opt.identifier)?.name ||
          opt.identifier,
      'identifier' in opt
        ? opt.identifier
        : opt.flags['chris-premades'].info.identifier,
    ]);
    const selectedId = await dialogUtils.buttonDialog(
      feat.name,
      'Select Devious Exploit or Subclass Feature',
      buttons,
      { userId },
    );
    selectedOption = allUsableOptions.find(
      (opt) =>
        ('identifier' in opt
          ? opt.identifier
          : opt.flags['chris-premades'].info.identifier) === selectedId,
    );
    if (!selectedOption) return;
  }

  const featureItem = isSubclassFeatureData(selectedOption)
    ? (itemUtils.getItemByIdentifier(
        feat.actor!,
        selectedOption.identifier,
      ) as Item<'feat'>)
    : selectedOption;
  // Using Cunning Strike means using Sneak Attack by default
  await spendUses(featureItem, feat.actor!, workflow);
  const target = workflow.hitTargets.first() as Token;
  if (isSubclassFeatureData(selectedOption)) {
    await selectedOption.handler({
      trigger: { ...trigger, entity: featureItem },
      workflow,
      ditem: undefined,
      selectedFeature: featureItem,
      target,
    });
    return;
  }

  const exploitIdentifier = featureItem.flags['chris-premades'].info.identifier;
  const exploitData = deviousExploits[exploitIdentifier];
  if (!exploitData) {
    console.error(
      `Cunning Strike: No exploit data found for identifier ${exploitIdentifier}`,
    );
    return;
  }
  await exploitData.handler({
    trigger: { ...trigger, entity: featureItem },
    workflow,
    ditem: undefined,
    pre: async (_) => true,
    post: async (_) => Promise.resolve(),
  });
};

const spendUses = async (
  exploitOrFeature: Item<'feat'> | SubclassFeatureCunningStrikeData,
  actor: Actor5e,
  workflow: Workflow,
) => {
  setWorkflowProperty(workflow, actor, 'sneakAttack', 1);
  let sneakAttackDiceCost = 0;
  if (
    'system' in exploitOrFeature &&
    exploitOrFeature.system.type.subtype === 'deviousExploit'
  ) {
    const prerequisiteLevel = exploitOrFeature.system.prerequisites?.level ?? 1;
    sneakAttackDiceCost = 1 + Math.floor((prerequisiteLevel - 1) / 4);
  } else if ('sneakAttackDiceCost' in exploitOrFeature) {
    sneakAttackDiceCost = exploitOrFeature.sneakAttackDiceCost;
  } else {
    console.warn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `Cunning Strike: Sneak Attack Dice Cost not defined for ${'name' in exploitOrFeature ? exploitOrFeature.name : (exploitOrFeature as any).system.identifier}`,
    );
  }
  reduceSneakAttack(workflow, actor, sneakAttackDiceCost);
};

const macro: CPRMacro = {
  identifier: 'ac55eCunningStrike',
  name: 'Cunning Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: async (data) =>
          await prompt({ ...data, deviousExploits: PAR_DEVIOUS_EXPLOITS }),
        priority: 5,
      },
      {
        pass: 'attackRollComplete',
        macro: async (data) =>
          await prompt({ ...data, deviousExploits: ARC_DEVIOUS_EXPLOITS }),
        priority: 5,
      },
    ],
  },
};

export default macro;
