import { Workflow } from '@midi-qol/types/module/Workflow.js';
import {
  ExploitPrerequisiteCheck,
  isWeaponAttack,
  meleeWeaponAttackHitCheck,
  meleeWeaponAttackRedirectCheck,
  weaponAttackHitCheck,
} from 'automation/weaponUtils.js';
import CPRMacro, { DItem, Trigger } from 'chris-premades/macro.js';
import { genericARCWorkflow } from 'exploits/handling/genericARCExploit.js';
import { useWorkflow } from 'exploits/handling/genericUseExploit.js';
import { AutoExploitWorkflow } from 'exploits/types/autoExploitTypes.js';
import { getAltMartialExploitsRemaining } from 'exploits/utils.js';

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

const pre = (feat: Item<'feat'>): boolean => {
  if (!feat.actor) return false;
  const altClasses55eFlags = feat.actor.flags['alternate-classes-55e'];
  if (altClasses55eFlags?.macros?.exploit?.used) return false;
  if (altClasses55eFlags?.macros?.['cunning-strike']) return false;
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const sneakAttack = itemUtils.getItemByIdentifier(
    feat.actor,
    'ac55eSneakAttack',
  ) as Item<'feat'> | undefined;
  if (!sneakAttack?.system.uses?.value) return false;
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
  if (!pre(feat)) return;
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
  if (!usableDeviousExploits.length) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;
  let selectedDeviousExploit: Item<'feat'>;
  if (usableDeviousExploits.length === 1) {
    selectedDeviousExploit = usableDeviousExploits[0];
  } else {
    const buttons: [string, Item<'feat'>][] = usableDeviousExploits.map((i) => [
      i.name,
      i,
    ]);
    selectedDeviousExploit = await dialogUtils.buttonDialog(
      feat.name,
      'Select Devious Exploit',
      buttons,
      { userId },
    );
    if (!selectedDeviousExploit) return;
  }
  // Use devious exploit
  await deviousExploits[
    selectedDeviousExploit.flags['chris-premades'].info.identifier
  ].handler({
    trigger: { ...trigger, entity: selectedDeviousExploit },
    workflow,
    ditem: undefined,
    pre: async (_) => true,
  });
  // Using Cunning Strike means using Sneak Attack by default
  await post(selectedDeviousExploit);
};

const post = async (exploit: Item<'feat'>) => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.setFlag(
    exploit.actor!,
    'alternate-classes-55e',
    'macros.sneak-attack',
    1,
  );
  const prerequisiteLevel = exploit.system.prerequisites.level ?? 1;
  const sneakAttackDiceCost = 1 + Math.floor((prerequisiteLevel - 1) / 4);
  await genericUtils.setFlag(
    exploit.actor!,
    'alternate-classes-55e',
    'macros.cunning-strike',
    sneakAttackDiceCost,
  );
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
