import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { spendExploitUses } from 'exploits/utils/exploitUtils.js';
import { SaveActivity } from 'fvtt-types/Activity.js';
import handleEnchantedShot from './handle.js';

export const getTokensInCircularTemplate = async (
  item: Item<'feat'>,
  workflow: Workflow,
  target: Token,
  distance: number,
): Promise<Token[]> => {
  const {
    utils: { genericUtils, templateUtils, workflowUtils, effectUtils },
  } = chrisPremades;
  const templateData = {
    angle: 0,
    direction: 0,
    distance: canvas!.scene!.grid.distance * distance,
    x: target.center.x,
    y: target.center.y,
    t: 'circle' as const,
    user: game.user,
    fillColor: game.user!.color.css,
    width: 5,
  };
  const effectData = {
    name: genericUtils.format('CHRISPREMADES.GenericEffects.TemplateEffect', {
      itemName: 'Legendary Sylvan Archer',
    }),
    img: item.img,
    origin: item.uuid,
    duration: {
      seconds: 1,
      turns: 1,
    },
  };
  const [template] = await canvas!.scene!.createEmbeddedDocuments(
    'MeasuredTemplate',
    [templateData],
  );
  await genericUtils.sleep(100);
  const effect = await effectUtils.createEffect(item.actor!, effectData);
  await effectUtils.addDependent(effect, [template]);
  await workflowUtils.addEntityRemoval(workflow, [effect]);
  return Array.from(templateUtils.getTokensInTemplate(template));
};

const getLegendarySylvanArcherTokens = async (
  item: Item<'feat'>,
  workflow: Workflow,
  target: Token,
): Promise<Token[]> => {
  if (
    !item.actor!.flags['alternate-classes-55e']?.macros?.enchantedShot
      ?.legendarySylvanArcher
  )
    return [target];
  console.log('Ran Legendary Sylvan Archer');
  const {
    utils: { dialogUtils },
  } = chrisPremades;
  /**
   * Legendary Sylvan Archer adds tokens in a 20 ft radius of the target
   * to the save activity
   */
  const tokens = await getTokensInCircularTemplate(item, workflow, target, 4);
  const selectedTokens = (await dialogUtils.selectTargetDialog(
    'Legendary Sylvan Archer',
    `Select up to ${tokens.length} targets for saving throw`,
    tokens,
    {
      type: 'multiple',
      maxAmount: tokens.length,
      skipDeadAndUnconscious: false,
    },
  )) as [Token[], boolean];
  if (!selectedTokens[0].length) return tokens;
  return selectedTokens[0];
};

export const pre = async (
  item: Item<'feat'>,
  workflow: Workflow,
): Promise<Token[]> => {
  if (
    !item.actor!.flags['alternate-classes-55e']?.macros?.enchantedShot?.[
      item.system.identifier
    ]
  )
    return [];
  const target = workflow.hitTargets.first() as Token;
  return Array.from(
    new Set<Token>([
      target, // The target always makes the saving throw
      ...(await getLegendarySylvanArcherTokens(item, workflow, target)),
    ]),
  );
};

const during = async (
  item: Item<'feat'>,
  workflow: Workflow,
  tokens: Token[],
) => {
  const {
    utils: { activityUtils, genericUtils, itemUtils, workflowUtils },
  } = chrisPremades;
  if (!workflow.token) return 0;
  const exploitDie = getAlternateMartialExploitDie(item.actor!);
  if (!exploitDie) return 0;
  const activity = activityUtils.getActivityByIdentifier(item, 'save', {
    strict: true,
  });
  if (!activity) return 0;
  const saveActivityData: SaveActivity = genericUtils.duplicate(activity);
  const usedLegendarySylvanArchery =
    item.actor!.flags['alternate-classes-55e']?.macros?.enchantedShots
      ?.legendarySylvanArcher;
  const exploitDice = usedLegendarySylvanArchery ? 3 : 2;
  if (saveActivityData.damage.parts.length) {
    saveActivityData.damage.parts[0].custom.enabled = true;
    saveActivityData.damage.parts[0].custom.formula = `${exploitDice}d${exploitDie}`;
  }
  // If the actor has Sylvan Shot, on save the target takes half damage
  const sylvanShot = itemUtils.getItemByIdentifier(
    item.actor!,
    'ac55eSylvanShot',
  );
  if (sylvanShot) saveActivityData.damage.onSave = 'half';
  const saveWorkflow = await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    item,
    item.actor!,
    tokens,
    { consumeResources: true },
  );
  const data = { item, workflow, saveWorkflow };
  await handleEnchantedShot(data);
  return 1;
};

export const post = async (item: Item<'feat'>, uses: number) => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await spendExploitUses(item, uses);
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
  if (!res1.length) return;
  const res2 = await during(feat, workflow, res1);
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
