import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { EffectData } from 'types/effects.js';
import { getElementDamage } from '../subclasses/path-of-elemental-chaos/heartOfChaos.js';
import {
  getWildSorceryResult,
  handleRollWildSorceryTable,
} from '../subclasses/path-of-sorcery/wildSorcery.js';
import { hasDivineAlignmentEvil } from '../subclasses/path-of-the-zealot/divineAlignmentEvil.js';
import { hasDivineAlignmentGood } from '../subclasses/path-of-the-zealot/divineAlignmentGood.js';
import { hasDivineAlignmentNeutral } from '../subclasses/path-of-the-zealot/divineAlignmentNeutral.js';
import { extendRage } from './rageEffect.js';

const getRageEffect = (feat: Item<'feat'>): ActiveEffect => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const effect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eRageEffect',
  );
  return effect as unknown as ActiveEffect;
};

const use: MacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: { effectUtils, genericUtils, itemUtils },
  } = chrisPremades;
  // If the effect already exists, extend it
  const effect = getRageEffect(feat);
  if (effect) return await extendRage(effect as unknown as ActiveEffect);
  if (!feat.system.uses?.value)
    return genericUtils.notify('Rage is out of uses', 'warn');
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  const seconds =
    feat.actor!.classes['alternate-barbarian'].system.levels < 15 ? 600 : 3600;
  const spectralWarriors = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eSpectralWarriors',
  );
  if (spectralWarriors) {
    await genericUtils.setFlag(
      spectralWarriors,
      'alternate-classes-55e',
      'spectralWarriorsSpace',
      feat.actor!.uuid!,
    );
  }
  let overrideRageDamageType = '';
  if (hasDivineAlignmentEvil(feat.actor!, true)) {
    overrideRageDamageType = '[necrotic]';
  } else if (hasDivineAlignmentNeutral(feat.actor!, true)) {
    overrideRageDamageType = '[thunder]';
  } else if (hasDivineAlignmentGood(feat.actor!, true)) {
    overrideRageDamageType = '[radiant]';
  } else {
    const wildSorceryResult = getWildSorceryResult(feat.actor!);
    if (wildSorceryResult === 1) {
      overrideRageDamageType = '[necrotic]';
    } else {
      const pathOfElementalChaosElement = getElementDamage(feat.actor!, true);
      if (pathOfElementalChaosElement)
        overrideRageDamageType = `[${pathOfElementalChaosElement}]`;
    }
  }
  const effectData: EffectData = {
    name: 'Rage',
    icon: feat.img,
    duration: {
      seconds,
    },
    origin: feat.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
        enableCondition:
          "!effects.some(e => e.name.toLowerCase() === 'unconscious')",
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eRageEffect',
        },
        macros: {
          midi: {
            actor: ['ac55eRageEffect'],
          },
          combat: ['ac55eRageEffect'],
          skill: ['ac55eRageEffect'],
          check: ['ac55eRageEffect'],
        },
      },
    },
    changes: [
      {
        key: 'system.abilities.str.save.roll.mode',
        mode: 2,
        value: '1',
        priority: 20,
      },
      {
        key: 'system.abilities.str.check.roll.mode',
        mode: 2,
        value: '1',
        priority: 20,
      },
      {
        key: 'system.abilities.con.check.roll.mode',
        mode: 2,
        value: '1',
        priority: 20,
      },
      {
        key: 'flags.automated-conditions-5e.damage.bonus',
        mode: 0,
        value: `bonus=1${exploitDie}${overrideRageDamageType}; ability.str && (mwak || rwak);`,
        priority: 0,
      },
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: 'bludgeoning',
        priority: 0,
      },
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: 'piercing',
        priority: 0,
      },
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: 'slashing',
        priority: 0,
      },
      {
        key: 'system.attributes.concentration.limit',
        mode: 0,
        value: '0',
        priority: 0,
      },
    ],
    statuses: [],
  };
  const rageEffect = await effectUtils.createEffect(feat.actor!, effectData, {
    rules: 'modern',
  });
  const wildSorcery = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eWildSorcery',
  );
  if (wildSorcery) {
    await handleRollWildSorceryTable(feat.actor!, rageEffect);
  }
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });
};

const dangerSensePrompt: MacroFunction = async (data) => {
  const {
    trigger: { entity },
  } = data;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  const {
    utils: { dialogUtils, itemUtils, socketUtils },
  } = chrisPremades;
  if (!itemUtils.getItemByIdentifier(feat.actor!, 'ac55eDangerSense')) return;
  if (getRageEffect(feat)) return;
  const userId = socketUtils.firstOwner(feat, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;
  await use(data);
};

const macro: CPRMacro = {
  identifier: 'ac55eRage',
  name: 'Rage',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: use,
        priority: 0,
        activities: ['use'],
      },
    ],
  },
  combat: [
    {
      pass: 'combatStart',
      macro: dangerSensePrompt,
      priority: 10,
    },
  ],
};

export default macro;
