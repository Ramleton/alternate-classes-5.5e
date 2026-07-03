import { Workflow } from '@midi-qol/types/module/Workflow.js';
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
import CPRMacro, { DItem, Trigger } from 'chris-premades/macro.js';
import { genericARCWorkflow } from 'exploits/handling/genericARCExploit.js';
import { useWorkflow } from 'exploits/handling/genericUseExploit.js';
import { AutoExploitWorkflow } from 'exploits/types/autoExploitTypes.js';
import { getAltMartialExploitsRemaining } from 'exploits/utils.js';
import {
  qualifiesForSneakAttack,
  reduceSneakAttack,
} from '../utils/sneakAttackUtils.js';

type ExploitHandler = AutoExploitWorkflow;

type AutoExploitType = 'ARC' | 'PAR';

interface ExploitData {
  prerequisiteCheck: ExploitPrerequisiteCheck;
  handler: ExploitHandler;
}

const getExploitData = (
  prerequisiteCheck: ExploitPrerequisiteCheck,
  autoExploitType: AutoExploitType,
): ExploitData => {
  let handler = genericARCWorkflow;
  if (autoExploitType === 'PAR') handler = useWorkflow;
  return {
    prerequisiteCheck,
    handler,
  };
};

const PAR_DEVIOUS_EXPLOITS: Record<string, ExploitData> = {
  ac55ePrecisionStrikeExploit: getExploitData(isWeaponAttack, 'PAR'),
};

const ARC_DEVIOUS_EXPLOITS: Record<string, ExploitData> = {
  ac55eArrestingStrikeExploit: getExploitData(weaponAttackHitCheck, 'ARC'),
  ac55eDisarmExploit: getExploitData(meleeWeaponAttackHitCheck, 'ARC'),
  ac55eSweepingStrikeExploit: getExploitData(meleeWeaponAttackHitCheck, 'ARC'),
  ac55eCripplingStrikeExploit: getExploitData(meleeWeaponAttackHitCheck, 'ARC'),
  ac55eDirtyHitExploit: getExploitData(meleeWeaponAttackHitCheck, 'ARC'),
  ac55eExposingStrikeExploit: getExploitData(weaponAttackHitCheck, 'ARC'),
  ac55eGlancingBlowExploit: getExploitData(
    meleeWeaponAttackRedirectCheck,
    'ARC',
  ),
};

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

const pre = (feat: Item<'feat'>, workflow: Workflow): boolean => {
  if (!feat.actor) return false;
  const altClasses55eFlags = feat.actor.flags['alternate-classes-55e'];
  if (altClasses55eFlags?.macros?.exploit?.used) return false;
  if (getWorkflowProperty(workflow, 'cunningStrike')) return false;
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const sneakAttack = itemUtils.getItemByIdentifier(
    feat.actor,
    'ac55eSneakAttack',
  ) as Item<'feat'>;
  if (!qualifiesForSneakAttack(sneakAttack, workflow)) return false;
  return true;
};

type PromptFunction = ({
  trigger,
  workflow,
  ditem,
  deviousExploits,
}: {
  trigger: Trigger;
  workflow: Workflow;
  ditem?: DItem;
  deviousExploits: Record<string, ExploitData>;
}) => Promise<void>;

const prompt: PromptFunction = async ({
  trigger,
  workflow,
  deviousExploits,
}) => {
  const { entity, token } = trigger;
  const feat = entity as Item<'feat'>;
  if (!pre(feat, workflow)) return;
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
  const deadlyBlades = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eDeadlyBlades',
  ) as Item<'feat'> | undefined;
  const usableFeatures: Item<'feat'>[] = usableDeviousExploits;
  if (deadlyBlades && deviousExploits === ARC_DEVIOUS_EXPLOITS)
    usableFeatures.push(deadlyBlades);
  if (!usableFeatures.length) return;
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
  let selectedFeature: Item<'feat'>;
  if (usableFeatures.length === 1) {
    selectedFeature = usableFeatures[0];
  } else {
    const buttons: [string, Item<'feat'>][] = usableFeatures.map((i) => [
      i.name,
      i.flags['chris-premades'].info.identifier,
    ]);
    const selectedId = await dialogUtils.buttonDialog(
      feat.name,
      'Select Devious Exploit or Subclass Feature',
      buttons,
      { userId },
    );
    selectedFeature = usableFeatures.find(
      (i) => i.flags['chris-premades'].info.identifier === selectedId,
    )!;
    if (!selectedFeature) return;
  }
  // Using Cunning Strike means using Sneak Attack by default
  await spendUses(selectedFeature, workflow);
  const target = workflow.hitTargets.first() as Token;
  switch (selectedFeature.system.identifier) {
    case 'deadly-blades':
      await runActivity(selectedFeature, 'save', [target]);
      break;
    default:
      // Use devious exploit
      await deviousExploits[
        selectedFeature.flags['chris-premades'].info.identifier
      ].handler({
        trigger: { ...trigger, entity: selectedFeature },
        workflow,
        ditem: undefined,
        pre: async (_) => true,
        post: async (_) => Promise.resolve(),
      });
  }
};

const spendUses = async (exploit: Item<'feat'>, workflow: Workflow) => {
  setWorkflowProperty(workflow, 'sneakAttack', 1);
  let sneakAttackDiceCost = 0;
  if (exploit.system.type.subtype === 'deviousExploit') {
    const prerequisiteLevel = exploit.system.prerequisites?.level ?? 1;
    sneakAttackDiceCost = 1 + Math.floor((prerequisiteLevel - 1) / 4);
  } else {
    switch (exploit.system.identifier) {
      case 'deadly-blades':
        sneakAttackDiceCost = 1;
        break;
    }
  }
  reduceSneakAttack(workflow, sneakAttackDiceCost);
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
