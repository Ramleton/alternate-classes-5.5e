import { Workflow } from '@midi-qol/types/module/Workflow.js';
import AlternateClasses55e from '../../../../../types/alternate-classes-55e.js';
import CPRMacro, { MacroFunction } from '../../../../../types/chris-premades/macro.js';
import handleEnchantedShot from './handle.js';

const pre = async (item) => {
  return item
    .actor
    .flags['alternate-classes-55e']
    ?.macros
    ?.enchantedShot
    ?.[item.identifier];
};

const during = async (
  item,
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
) => {
  const { utils: { activityUtils, genericUtils, itemUtils, workflowUtils } }
    = chrisPremades;
  if (!workflow.token) return 0;
  const exploitDie = altClassesModule
    ?.api
    ?.getAlternateMartialExploitDie(item);
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
    item.actor,
    'ac55eSylvanShot',
  );
  if (sylvanShot)
    saveActivityData.damage.onSave = 'half';
  const saveWorkflow = await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    item,
    item.actor,
    [workflow.hitTargets.first() as Token],
    { consumeResources: true },
  );
  const data = { item, workflow, saveWorkflow, altClassesModule };
  await handleEnchantedShot(data);
  return 1;
};

const post = async (
  item,
  uses: number,
  altClassesModule: AlternateClasses55e,
) => {
  const { utils: { genericUtils } }
    = chrisPremades;
  altClassesModule.api.spendAlternateMartialExploitUses(uses, item);
  await genericUtils.unsetFlag(
    item.actor,
    'alternate-classes-55e',
    `macros.enchantedShot.${item.identifier}`,
  );
};

const workflow: MacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const res1 = await pre(item);
  if (!res1) return;
  const res2 = await during(item, workflow, altClassesModule);
  await post(item, res2, altClassesModule);
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
