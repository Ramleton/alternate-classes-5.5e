import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { SaveActivity } from 'fvtt-types/Activity.js';
import { post, pre } from '../enchantedShotSave.js';

const during = async (
  token: Token,
  targets: Token[],
  item: Item<'feat'>,
  workflow: Workflow,
): Promise<number> => {
  const { utils: {
    activityUtils,
    genericUtils,
    itemUtils,
    effectUtils,
    workflowUtils,
    tokenUtils,
    templateUtils,
  } }
    = chrisPremades;
  if (!token) return 0;
  const exploitDie = getAlternateMartialExploitDie(item);
  if (!exploitDie) return 0;
  const activity = activityUtils.getActivityByIdentifier(
    item,
    'save',
    { strict: true },
  );
  if (!activity) return 0;
  const target = workflow.hitTargets.first() as Token;
  const range = tokenUtils.getDistance(token, target);
  const saveActivityData: SaveActivity = genericUtils.duplicate(activity);
  const ray = new foundry.canvas.geometry.Ray(
    token.center,
    target.center,
  );
  if (!ray.distance) return 0;
  const templateData = {
    angle: 0,
    direction: Math.toDegrees(ray.angle),
    distance:
      canvas!.scene!.grid.distance * 6.5,
    x: ray.B.x,
    y: ray.B.y,
    t: 'ray' as const,
    user: game.user,
    fillColor: game.user!.color.css,
    width: 5,
  };
  const effectData = {
    name: genericUtils.format(
      'CHRISPREMADES.GenericEffects.TemplateEffect',
      { itemName: workflow.item.name },
    ),
    img: workflow.item.img,
    origin: workflow.item.uuid,
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
  const tokens = templateUtils.getTokensInTemplate(template);
  saveActivityData.range.value = '' + range;
  const usedLegendarySylvanArchery = item
    .actor!
    .flags['alternate-classes-55e']
    ?.macros
    ?.enchantedShots
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
  const effect = await effectUtils.createEffect(workflow.actor, effectData);
  await effectUtils.addDependent(effect, [template]);
  await workflowUtils.addEntityRemoval(workflow, [effect]);
  const piercedTargets = Array.from(new Set([
    ...targets,
    ...Array.from(tokens)],
  ));
  if (!targets.length) return 1;
  if (sylvanShot)
    saveActivityData.damage.onSave = 'half';
  await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    item,
    item.actor!,
    piercedTargets,
    { consumeResources: true },
  );
  return 1;
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item.OfType<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, workflow);
  if (!res1.length) return;
  const res2 = await during(token, res1, feat, workflow);
  await post(feat, res2);
};

const macro: CPRMacro = {
  identifier: 'ac55ePiercingShot',
  name: 'Enchanted Shot: Piercing Shot',
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
