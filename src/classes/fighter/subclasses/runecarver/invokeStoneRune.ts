import {
  activityUtils,
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  workflowUtils,
} from 'chrisPremades';
import { AlternateClasses55e } from '../../../../types/alternate-classes-55e';

async function pre(
  item,
  target: Token,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const inscriptions = item.actor.items.filter(i =>
    itemUtils.getEffectByIdentifier(i, 'ac55eStoneRuneInscription'));
  if (inscriptions.length < 2) return false;
  const actorFlags = item.actor.flags['alternate-classes-55e'];
  if (actorFlags?.macros?.runeCarver?.stone)
    return false;
  if (item.system.uses.spent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elderInsight: any = itemUtils.getItemByIdentifier(
      item.actor,
      'ac55eElderInsight',
    );
    if (!elderInsight) return false;
    if (actorFlags?.macros?.runeCarver?.elderInsight?.stone) return false;
    if (!altClassesModule.api.getAltMartialExploitsRemaining(item))
      return false;
  }
  return await dialogUtils.confirm(
    item.name,
    `${target.actor!.name} ended their turn within 30 feet of you, \
    invoke Stone Rune?`,
    { userId: socketUtils.firstOwner(item.actor, true) },
  );
}

async function during(
  item,
  target,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const exploitDie = altClassesModule.api.getAlternateMartialExploitDie(item);
  if (!exploitDie) return false;
  const invokeActivity = activityUtils.getActivityByIdentifier(
    item,
    'invoke',
    { strict: true },
  );
  if (!invokeActivity) return false;
  const saveDCActivity = activityUtils.getActivityByIdentifier(item, 'saveDC', {
    strict: true,
  });
  if (!saveDCActivity) return false;
  const invokeWorkflow = await workflowUtils.syntheticActivityRoll(
    invokeActivity,
    [target],
  );
  if (!invokeWorkflow.failedSaves.size) return true;
  const saveDCWorkflow = await workflowUtils.syntheticActivityRoll(
    saveDCActivity,
    [],
  );
  const saveDC = saveDCWorkflow.utilityRolls?.[0].total ?? 0;
  await genericUtils.setFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.runeCarver.stone',
    1,
  );
  const stoneRuneEffect = {
    name: 'Stone Rune: Dreaming',
    icon: item.img,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eStoneRuneEffect',
        },
      },
    },
    statuses: new Set(['incapacitated']),
    changes: [
      {
        key: 'flags.midi-qol.OverTime',
        mode: 0,
        value: `turn=end, label=Stone Rune: Dreaming, saveAbility=wis, \
        saveDC=${saveDC}, saveMagic=true, saveCount=1-, \
        allowIncapacitated=true`,
        priority: 20,
      },
      {
        key: 'system.attributes.movement.all',
        mode: 0,
        value: '*0',
        priority: 20,
      },
    ],
  };
  await effectUtils.createEffect(target.actor, stoneRuneEffect);
  return true;
}

async function post(
  item,
  altClassesModule: AlternateClasses55e,
): Promise<void> {
  if (item.system.uses.spent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elderInsight: any = itemUtils.getItemByIdentifier(
      item.actor,
      'ac55eElderInsight',
    );
    if (!elderInsight) return;
    await genericUtils.setFlag(
      item.actor,
      'alternate-classes-55e',
      'macros.runeCarver.elderInsight.stone',
      1,
    );
    altClassesModule.api.spendAlternateMartialExploitUses(1, item);
  }
  else {
    await item.update({ 'system.uses.spent': item.system.uses.spent + 1 });
  }
}

async function workflow({ trigger: { entity: item, target } }) {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const res1 = await pre(item, target, altClassesModule);
  if (!res1) return;
  const res2 = await during(item, target, altClassesModule);
  if (!res2) return;
  await post(item, altClassesModule);
}

export const ac55eInvokeStoneRune = {
  name: 'Stone Rune: Invoke',
  version: '1.3.141',
  rules: 'modern',
  combat: [
    {
      pass: 'turnEndNear',
      macro: workflow,
      priority: 200,
      disposition: 'enemy',
    },
  ],
};
