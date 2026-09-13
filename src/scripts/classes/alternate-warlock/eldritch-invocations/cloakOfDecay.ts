import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';

const handle: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const cloakOfDecayEffect = effectUtils.getEffectByIdentifier(
    feat.actor,
    'ac55eCloakOfDecayEffect',
  );
  if (cloakOfDecayEffect) return await cloakOfDecayEffect.delete();
  const effectData: EffectData = {
    name: 'Cloak of Decay',
    icon: feat.img!,
    duration: {},
    origin: feat.uuid!,
    flags: {},
    changes: [
      {
        key: 'system.skills.itm.roll.mode',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: '1',
        priority: 0,
      },
      {
        key: 'system.skills.per.roll.mode',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: '-1',
        priority: 0,
      },
      {
        key: 'system.skills.dec.roll.mode',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: '-1',
        priority: 0,
      },
      {
        key: 'system.skills.prf.roll.mode',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: '-1',
        priority: 0,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(feat.actor!, effectData, {
    identifier: 'ac55eCloakOfDecayEffect',
    rules: 'modern',
    macros: {
      combat: ['ac55eCloakOfDecayEffect'],
    },
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eCloakOfDecay',
  name: 'Eldritch Invocations: Cloak of Decay',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 0,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
