import { Workflow } from '@midi-qol/types/module/Workflow';
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
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const inscriptions = item.actor.items.filter(i =>
    itemUtils.getEffectByIdentifier(i, 'ac55eFireRuneInscription'));
  if (inscriptions.length < 2) return false;
  if (workflow.activity?.getActionType() !== 'mwak')
    return false;
  if (!workflow.hitTargets.size) return false;
  const actorFlags = item.actor.flags['alternate-classes-55e'];
  if (actorFlags?.macros?.runeCarver?.fire)
    return false;
  if (item.system.uses.spent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elderInsight: any = itemUtils.getItemByIdentifier(
      item.actor,
      'ac55eElderInsight',
    );
    if (!elderInsight) return false;
    if (actorFlags?.macros?.runeCarver?.elderInsight?.fire) return false;
    if (!altClassesModule.api.getAltMartialExploitsRemaining(item))
      return false;
  }
  return await dialogUtils.confirm(
    item.name,
    'You hit a creature with a melee weapon attack. Invoke Fire Rune?',
    { userId: socketUtils.firstOwner(item.actor, true) },
  );
}

async function during(
  item,
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const exploitDie = altClassesModule.api.getAlternateMartialExploitDie(item);
  if (!exploitDie) return false;
  const invokeActivity = activityUtils.getActivityByIdentifier(
    item,
    'invokeFireRune',
    { strict: true },
  );
  if (!invokeActivity) return false;
  const saveDCActivity = activityUtils.getActivityByIdentifier(item, 'saveDC', {
    strict: true,
  });
  if (!saveDCActivity) return false;
  const target = workflow.hitTargets.first()! as Token;
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
  const dmgFormula = `2d${exploitDie.faces}`;
  await genericUtils.setFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.runeCarver.fire',
    dmgFormula,
  );
  const fireRuneEffect = {
    name: 'Fire Rune: Restrained',
    icon: item.img,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eFireRuneEffect',
        },
      },
    },
    statuses: new Set(['restrained']),
    changes: [
      {
        key: 'flags.midi-qol.OverTime',
        mode: 0,
        value: `turn=start, label=Fire Rune, saveAbility=str, \
        saveDC=${saveDC}, saveMagic=true, damageRoll=${dmgFormula}, \
        damageType=fire, damageBeforeSave=true, saveCount=1-, actionSave=roll, \
        allowIncapacitated=true`,
      },
    ],
  };
  await effectUtils.createEffect(target.actor!, fireRuneEffect);
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
      'macros.runeCarver.elderInsight.fire',
      1,
    );
    altClassesModule.api.spendAlternateMartialExploitUses(1, item);
  }
  else {
    await item.update({ 'system.uses.spent': item.system.uses.spent + 1 });
  }
}

async function workflow({
  trigger: { entity: item },
  workflow,
}) {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const res1 = await pre(item, workflow, altClassesModule);
  if (!res1) return;
  const res2 = await during(item, workflow, altClassesModule);
  if (!res2) return;
  await post(item, altClassesModule);
}

export const ac55eInvokeFireRune = {
  name: 'Fire Rune: Invoke',
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
