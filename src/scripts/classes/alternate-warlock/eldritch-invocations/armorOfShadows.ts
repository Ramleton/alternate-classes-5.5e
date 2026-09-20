import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';
import { getPactAbility } from '../utils.js';

const CALC_MAP: Record<string, string> = {
  int: 'ac55eArmorOfShadowsIntelligence',
  wis: 'ac55eArmorOfShadowsWisdom',
  cha: 'ac55eArmorOfShadowsCharisma',
};

const handle: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const armorOfShadowsEffect = effectUtils.getEffectByIdentifier(
    feat.actor,
    'ac55eArmorOfShadowsEffect',
  );
  if (armorOfShadowsEffect) return await armorOfShadowsEffect.delete();
  const pactAbility = getPactAbility(feat.actor);
  const calc = CALC_MAP[pactAbility] ?? CALC_MAP.cha;
  const effectData: EffectData = {
    name: 'Armor of Shadows',
    icon: feat.img!,
    duration: {},
    origin: feat.uuid!,
    flags: {
      'chris-premades': { info: { identifier: 'ac55eArmorOfShadowsEffect' } },
    },
    changes: [
      {
        key: 'system.attributes.ac.calc',
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: calc,
        priority: 20,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(feat.actor!, effectData);
};

const macro: CPRMacro = {
  identifier: 'ac55eArmorOfShadows',
  name: 'Eldritch Invocations: Armor of Shadows',
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
