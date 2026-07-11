import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';
import { extendRage } from './rageEffect.js';

const use: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: { effectUtils, genericUtils },
  } = chrisPremades;
  const effect = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eRageEffect',
  );
  // If the effect already exists, extend it
  if (effect) return await extendRage(effect as unknown as ActiveEffect);
  if (!feat.system.uses?.value)
    return genericUtils.notify('Rage is out of uses', 'warn');
  const effectData: EffectData = {
    name: 'Rage',
    icon: feat.img,
    duration: { seconds: 600 },
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
        value:
          "bonus=@scale.alternate-barbarian.exploit-die); ability.str && (mwak || rwak) && !effects.some(e => e.name.toLowerCase() === 'sorcery-01') && !effects.some(e => e.name.toLowerCase() === 'divine alignment: good');",
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
  await effectUtils.createEffect(feat.actor!, effectData, {
    rules: 'modern',
  });
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });
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
};

export default macro;
