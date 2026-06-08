import {
  effectUtils,
  genericUtils,
  itemUtils,
} from 'chrisPremades';
import { AlternateClasses55e } from '../../../../types/alternate-classes-55e';

async function runicMight(
  item,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const exploitDie = altClassesModule
    ?.api
    ?.getAlternateMartialExploitDie(item);
  if (!exploitDie) return false;
  const legendaryRuneLord = await itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eLegendaryRuneLord',
  );
  const formula = `1d${exploitDie.faces}`;
  const newSize = legendaryRuneLord ? 'huge' : 'lg';
  const runicMightEffectData = {
    name: 'Runic Might',
    icon: item.img,
    origin: item.uuid,
    duration: { seconds: 60 },
    flags: {
      'dae': {
        enableCondition:
          '!effects.some(e => e.name.toLowerCase() === \'incapacitated\')',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eRunicMightEffect',
        },
      },
    },
    changes: [
      {
        key: 'system.traits.size',
        mode: 5,
        value: newSize,
        priority: 20,
      },
      {
        key: 'system.abilities.str.check.roll.mode',
        mode: 2,
        value: 1,
        priority: 20,
      },
      {
        key: 'system.abilities.str.save.roll.mode',
        mode: 2,
        value: 1,
        priority: 20,
      },
      {
        key: 'flags.automated-conditions-5e.damage.bonus',
        mode: 0,
        value: `bonus=${formula}; oncePerTurn; mwak;`,
        priority: 20,
      },
    ],
  };
  const effect = await
  effectUtils.createEffect(item.actor, runicMightEffectData);
  const duplicateItem = genericUtils.duplicate(item);
  duplicateItem.name = 'End Runic Might';
  duplicateItem.flags['chris-premades'] = {
    activityIdentifiers: {
      use: 'tW5OLuM40dC4Rm98',
    },
    info: {
      identifier: 'ac55eEndRunicMightItem',
    },
    macros: {
      midi: {
        item: ['ac55eEndRunicMight'],
      },
    },
  };
  duplicateItem.system.uses = undefined;
  for (const activity of Object.values(duplicateItem.system.activities)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((activity as any).consumption) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (activity as any).consumption.targets = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (activity as any).consumption.spellSlot = false;
    }
  }
  await itemUtils.createItems(
    item.actor, [duplicateItem], { parentEntity: effect },
  );
  return true;
}

async function workflow({ trigger: { entity: item } }) {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  await runicMight(item, altClassesModule);
}

export const ac55eRunicMight = {
  name: 'Runic Might',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: workflow,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};
