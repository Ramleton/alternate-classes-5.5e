import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';
import CPRMacro, { DItem, MidiMacroFunction } from 'chris-premades/macro.js';
import { spendDivineFervor } from '../utils/utils.js';

const pre = async (
  feat: Item<'feat'>,
  workflow: Workflow,
  ditem: DItem,
): Promise<boolean> => {
  const {
    utils: { constants, dialogUtils, itemUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  // Check if the attack was a melee attack
  if (!constants.meleeAttacks.some((a) => a === actionType)) return false;
  // Check if the attack actually did damage
  if (!ditem.totalDamage) return false;
  const divineFervor = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eDivineFervor',
  ) as Item<'feat'> | undefined;
  if (!divineFervor?.system?.uses?.value) return false;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  return selection;
};

const during = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<boolean> => {
  const activityWorkflow = await runActivity(feat, 'siphon', [workflow.token!]);
  return !!activityWorkflow;
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
  ditem,
}): Promise<void> => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!ditem) return;
  const res1 = await pre(feat, workflow, ditem);
  if (!res1) return;
  const res2 = await during(feat, workflow);
  if (!res2) return;
  await spendDivineFervor(feat.actor);
};

const macro: CPRMacro = {
  identifier: 'ac55eAnointedWarriorEvil',
  name: 'Anointed Warrior: Evil',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'applyDamage',
        macro: workflow,
        priority: 100,
      },
    ],
  },
};

export default macro;
