import { Workflow } from '@midi-qol/types/module/Workflow';
import {
  effectUtils,
  genericUtils,
  itemUtils,
} from 'chrisPremades';
import { AlternateClasses55e } from '../../../../types/alternate-classes-55e';

async function pre(
  item,
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const inscriptions = item.actor.items.filter(i =>
    itemUtils.getEffectByIdentifier(i, 'ac55eFrostRuneInscription'));
  if (inscriptions.length < 2) {
    genericUtils.notify(
      'You must have inscribed the Frost Rune into an item to use it',
      'error',
    );
  }
  if (!workflow.targets.size) return false;
  const actorFlags = item.actor.flags['alternate-classes-55e'];
  if (actorFlags?.macros?.runeCarver?.frost)
    return false;
  if (item.system.uses.spent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elderInsight: any = itemUtils.getItemByIdentifier(
      item.actor,
      'ac55eElderInsight',
    );
    if (!elderInsight) return false;
    if (actorFlags?.macros?.runeCarver?.elderInsight?.frost) return false;
    if (!altClassesModule.api.getAltMartialExploitsRemaining(item))
      return false;
  }
  return true;
}

async function during(
  item,
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const exploitDie = altClassesModule.api.getAlternateMartialExploitDie(item);
  if (!exploitDie) return false;
  const bonusFormula = `1d${exploitDie.faces}`;
  await genericUtils.setFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.runeCarver.frost',
    1,
  );
  const changes = [{
    key: 'system.attributes.movement.all',
    mode: 0,
    value: '+10',
    priority: 20,
  }];
  for (const ability of ['str', 'con']) {
    changes.push({
      key: `system.abilities.${ability}.bonuses.check`,
      mode: 2,
      value: bonusFormula,
      priority: 20,
    });
    changes.push({
      key: `system.abilities.${ability}.bonuses.save`,
      mode: 2,
      value: bonusFormula,
      priority: 20,
    });
  }
  const frostRuneEffect = {
    name: 'Frost Rune',
    icon: item.img,
    duration: { seconds: 600 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eFrostRuneEffect',
        },
      },
    },
    changes,
  };
  await effectUtils.createEffect(workflow.actor, frostRuneEffect);
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
      'macros.runeCarver.elderInsight.frost',
      1,
    );
    altClassesModule.api.spendAlternateMartialExploitUses(1, item);
  }
  else {
    await item.update({ 'system.uses.spent': item.system.uses.spent + 1 });
  }
  await genericUtils.unsetFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.runeCarver.frost',
  );
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

export const ac55eInvokeFrostRune = {
  name: 'Frost Rune: Invoke',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: workflow,
        priority: 200,
        activities: ['invoke'],
      },
    ],
  },
};
