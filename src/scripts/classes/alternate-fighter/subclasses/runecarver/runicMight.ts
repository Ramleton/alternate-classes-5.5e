import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAltMartialExploitDie } from 'exploits/utils.js';

const workflow: MidiMacroFunction = async ({
  trigger: { entity: item, token },
}) => {
  const feat = item as Item<'feat'>;
  const exploitDie = getAltMartialExploitDie(feat);
  if (!exploitDie) return false;
  const {
    utils: {
      activityUtils,
      effectUtils,
      dialogUtils,
      genericUtils,
      itemUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const legendaryRuneLord = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eLegendaryRuneLord',
  );
  const frostRune = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eFrostRune',
  );
  const hillRune = itemUtils.getItemByIdentifier(feat.actor!, 'ac55eHillRune');
  const activatableRunes: Item[] = [frostRune, hillRune].filter((i) => !!i);

  const options: [string, string][] = activatableRunes.map((rune) => [
    rune.name,
    rune.system.identifier,
  ]);
  if (options.length) {
    const selection = await dialogUtils.buttonDialog(
      feat.name,
      'Activate a rune?',
      options,
    );
    const selectedRune = () => {
      if (selection === 'frost-rune') return frostRune;
      if (selection === 'hill-rune') return hillRune;
      return null;
    };
    const selected = selectedRune();
    if (selected) {
      const invokeActivity = activityUtils.getActivityByIdentifier(
        selected,
        'invoke',
        { strict: true },
      );
      await workflowUtils.syntheticActivityRoll(invokeActivity, [token]);
    }
  }
  const formula = `1d${exploitDie.faces}`;
  const newSize = legendaryRuneLord ? 'huge' : 'lg';
  const runicMightEffectData = {
    name: 'Runic Might',
    icon: feat.img,
    origin: feat.uuid,
    duration: { seconds: 60 },
    flags: {
      dae: {
        // eslint-disable-next-line @stylistic/max-len
        enableCondition:
          "!effects.some(e => e.name.toLowerCase() === 'incapacitated')",
        stackable: 'noneName',
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
  const effect = await effectUtils.createEffect(
    feat.actor!,
    runicMightEffectData,
  );
  const duplicateItem = genericUtils.duplicate(feat) as Item<'feat'>;
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
  for (const activity of Object.values(
    duplicateItem.system.activities as object,
  )) {
    if (activity.consumption) {
      activity.consumption.targets = [];
      activity.consumption.spellSlot = false;
    }
  }
  await itemUtils.createItems(feat.actor!, [duplicateItem], {
    parentEntity: effect,
  });
  return true;
};

const macro: CPRMacro = {
  identifier: 'ac55eRunicMight',
  name: 'Runic Might',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
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

export default macro;
