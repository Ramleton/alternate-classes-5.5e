import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { getAlternateMartialExploitDie, spendAlternateMartialExploitUses } from 'exploits/utils.js';
import CPRMacro, { MidiMacroFunction } from '../../../../../types/chris-premades/macro.js';
import handleEnchantedShot from './handle.js';

export const pre = async (
  item: Item<'feat'>,
  workflow: Workflow,
) => {
  if (!workflow.hitTargets.size)
    return false;
  return item
    .actor!
    .flags['alternate-classes-55e']
    ?.macros
    ?.enchantedShot
    ?.[item.system.identifier];
};

const during = async (
  item: Item<'feat'>,
  workflow: Workflow,
) => {
  const { utils: { activityUtils, genericUtils, itemUtils, workflowUtils } }
    = chrisPremades;
  if (!workflow.token) return 0;
  const exploitDie = getAlternateMartialExploitDie(item);
  if (!exploitDie) return 0;
  const activity = activityUtils.getActivityByIdentifier(
    item,
    'save',
    { strict: true },
  );
  if (!activity) return 0;
  const saveActivityData = genericUtils.duplicate(activity);
  saveActivityData.damage.parts[0].custom.enabled = true;
  saveActivityData.damage.parts[0].custom.formula = `2d${exploitDie.faces}`;
  // If the actor has Sylvan Shot, on save the target takes half damage
  const sylvanShot = itemUtils.getItemByIdentifier(
    item.actor!,
    'ac55eSylvanShot',
  );
  if (sylvanShot)
    saveActivityData.damage.onSave = 'half';
  const saveWorkflow = await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    item,
    item.actor!,
    [workflow.hitTargets.first() as Token],
    { consumeResources: true },
  );
  const data = { item, workflow, saveWorkflow };
  await handleEnchantedShot(data);
  return 1;
};

export const post = async (
  item: Item<'feat'>,
  uses: number,
) => {
  const { utils: { genericUtils } }
    = chrisPremades;
  await spendAlternateMartialExploitUses(uses, item);
  await genericUtils.unsetFlag(
    item.actor!,
    'alternate-classes-55e',
    `macros.enchantedShot.${item.system.identifier}`,
  );
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  const feat = item as Item.OfType<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, workflow);
  if (!res1) return;
  const res2 = await during(feat, workflow);
  await post(feat, res2);
};

const macro: CPRMacro = {
  identifier: 'ac55eEnchantedShotSave',
  name: 'Enchanted Shot: Save',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: workflow,
        priority: 200,
      },
    ],
  },
};

export default macro;
