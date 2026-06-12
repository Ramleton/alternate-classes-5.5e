import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { SaveActivity } from 'fvtt-types/Activity.js';
import { pre as enchantedShotPre, getTokensInCircularTemplate, post } from '../enchantedShotSave.js';

const pre = async (
  item: Item<'feat'>,
  workflow: Workflow,
): Promise<Token[]> => {
  if (item
    .actor!
    .flags['alternate-classes-55e']
    ?.macros
    ?.enchantedShot
    ?.legendarySylvanArcher
  )
    return enchantedShotPre(item, workflow);
  const target = workflow.hitTargets.first() as Token;
  const tokens = await getTokensInCircularTemplate(
    item,
    workflow,
    target,
    2,
  );
  return Array.from(new Set<Token>([target, ...tokens]));
};

const during = async (
  item: Item<'feat'>,
  targets: Token[],
): Promise<number> => {
  const { utils: {
    activityUtils,
    genericUtils,
    itemUtils,
    workflowUtils,
  } }
    = chrisPremades;
  const exploitDie = getAlternateMartialExploitDie(item);
  if (!exploitDie) return 0;
  const activity = activityUtils.getActivityByIdentifier(
    item,
    'save',
    { strict: true },
  );
  if (!activity) return 0;
  const saveActivityData: SaveActivity = genericUtils.duplicate(activity);
  const usedLegendarySylvanArchery = item
    .actor!
    .flags['alternate-classes-55e']
    ?.macros
    ?.enchantedShot
    ?.legendarySylvanArcher;
  const exploitDice = usedLegendarySylvanArchery ? 3 : 2;
  saveActivityData.damage.parts[0].custom.enabled = true;
  saveActivityData.damage.parts[0].custom.formula
    = `${exploitDice}d${exploitDie.faces}`;
  // If the actor has Sylvan Shot, on save the target takes half damage
  const sylvanShot = itemUtils.getItemByIdentifier(
    item.actor!,
    'ac55eSylvanShot',
  );
  if (sylvanShot)
    saveActivityData.damage.onSave = 'half';
  await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    item,
    item.actor!,
    targets,
    { consumeResources: true },
  );
  return 1;
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  const feat = item as Item.OfType<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, workflow);
  if (!res1.length) return;
  const res2 = await during(feat, res1);
  await post(feat, res2);
};

const macro: CPRMacro = {
  identifier: 'ac55eBurstingShot',
  name: 'Enchanted Shot: Bursting Shot',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: workflow,
        priority: 210,
      },
    ],
  },
};

export default macro;
