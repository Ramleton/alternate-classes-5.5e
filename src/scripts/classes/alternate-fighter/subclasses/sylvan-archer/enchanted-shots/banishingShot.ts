import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { SaveActivity } from 'fvtt-types/Activity.js';
import { post, pre } from '../enchantedShotSave.js';

const during = async (
  item: Item<'feat'>,
  targets: Token[],
): Promise<number> => {
  const { utils: {
    activityUtils,
    genericUtils,
    itemUtils,
    effectUtils,
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
  saveActivityData.damage.parts = [];
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
    targets,
    { consumeResources: true },
  );
  const targetEffectData = {
    name: `${item.name}: Banished`,
    icon: item.img,
    origin: item.uuid,
    duration: { seconds: 60 },
    flags: {
      'dae': {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eBanishingShotEffect',
        },
      },
    },
    changes: [
      {
        key: 'flags.midi-qol.OverTime',
        mode: 0,
        value: `turn=start,allowIncapacitated=true,saveAbility=cha,\
          saveDC=${saveWorkflow.saveDC},saveDamage=nodamage,saveRemove=true,\
          saveMagic=true,actionSave=roll,saveCount=1-,rollMode=publicroll,`,
      },
      {
        key: 'flags.midi-qol.superSaver.all',
        mode: 0,
        value: 1,
        priority: 20,
      },
      {
        key: 'system.attributes.ac.bonus',
        mode: 5,
        value: 99,
        priority: 20,
      },
      {
        key: 'flags.midi-qol.min.ability.save.all',
        mode: 5,
        value: 99,
        priority: 20,
      },
      {
        key: 'flags.midi-qol.grants.noCritical.all',
        mode: 0,
        value: 1,
        priority: 20,
      },
      {
        key: 'flags.midi-qol.neverTarget',
        mode: 0,
        value: 1,
        priority: 20,
      },
      {
        key: 'macro.tokenMagic',
        mode: 0,
        value: 'spectral-body',
        priority: 20,
      },
    ],
  };
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor) continue;
    await effectUtils.createEffect(target.actor, targetEffectData, {
      rules: 'modern',
    });
  }
  return 1;
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item.OfType<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, workflow);
  if (!res1.length) return;
  const res2 = await during(feat, res1);
  await post(feat, res2);
};

const macro: CPRMacro = {
  identifier: 'ac55eBanishingShot',
  name: 'Enchanted Shot: Banishing Shot',
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
