import { Workflow } from '@midi-qol/types/module/Workflow';
import { activityUtils, genericUtils, itemUtils, workflowUtils } from 'chrisPremades';
import {
  AlternateClasses55e,
} from '../../../../../types/alternate-classes-55e';

async function pre(item): Promise<boolean> {
  return item
    .actor
    .flags['alternate-classes-55e']
    ?.macros
    ?.enchantedShot
    ?.[item.identifier];
}

async function during(
  item,
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
): Promise<number> {
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
  await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    item,
    item.actor,
    [workflow.hitTargets.first() as Token],
    { consumeResources: true },
  );
  return 1;
}

async function post(
  item,
  uses: number,
  altClassesModule: AlternateClasses55e,
): Promise<void> {
  altClassesModule.api.spendAlternateMartialExploitUses(uses, item);
  await genericUtils.unsetFlag(
    item.actor,
    'alternate-classes-55e',
    `macros.enchantedShot.${item.identifier}`,
  );
}

async function workflow({
  trigger: { entity: item },
  workflow,
}) {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const res1 = await pre(item);
  if (!res1) return;
  const res2 = await during(item, workflow, altClassesModule);
  await post(item, res2, altClassesModule);
}

export const ac55eBurstingShot = {
  name: 'Bursting Shot',
  version: '1.3.141',
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
