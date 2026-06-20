import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageType } from 'types/damage.js';
import { AuraActiveEffectData, EffectChange, EffectData } from 'types/effects.js';
import { getChosenElement } from './utils.js';

const use: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  const element = getChosenElement(feat.actor!);
  if (!element) return;
  let elementDamageType: DamageType;
  switch (element.flags['chris-premades']?.info?.identifier) {
    case 'ac55eOathOfSplendorAir':
      elementDamageType = 'thunder';
      break;
    case 'ac55eOathOfSplendorEarth':
      elementDamageType = 'bludgeoning';
      break;
    case 'ac55eOathOfSplendorFire':
      elementDamageType = 'fire';
      break;
    default:
      elementDamageType = 'cold';
  }
  const effectChange: EffectChange = {
    key: 'system.traits.dr.value',
    mode: 2,
    value: elementDamageType,
    priority: 50,
  };
  if (!feat.actor) return;
  const { utils: { effectUtils } } = chrisPremades;
  const effectData: EffectData = {
    name: 'Avatar of the Elements: Aura',
    icon: feat.img!,
    duration: { seconds: 60 },
    origin: feat.actor.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
        // eslint-disable-next-line @stylistic/max-len
        disableCondition: 'effects.some(e => e.name.toLowerCase() === \'unconscious\')',
      },
    },
    changes: [effectChange],
    statuses: [],
  };
  const immunityEffectData: EffectData = {
    ...effectData,
    changes: [{
      key: 'system.traits.di.value',
      mode: 2,
      value: elementDamageType,
      priority: 50,
    }],
    name: 'Avatar of the Elements: Immunity',
  };
  const auraEffectData: AuraActiveEffectData = {
    applyToSelf: false,
    bestFormula: '',
    canStack: false,
    collisionTypes: new Set(['move']),
    combatOnly: false,
    disableOnHidden: false,
    disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    distanceFormula: '@scale.alternate-paladin.aura-radius',
    evaluatePreApply: false,
    opacity: 0.25,
    overrideName: '',
    script: '',
    showRadius: false,
    stashedChanges: [],
    stashedStatuses: new Set(),
    validationFailures: new Set(),
    parent: effectData,
  };
  await effectUtils.createEffect(feat.actor!, immunityEffectData);
  await effectUtils.createEffect(feat.actor!, auraEffectData);
};

const macro: CPRMacro = {
  identifier: 'ac55eAvatarOfTheElements',
  name: 'Oath of Splendor: Avatar of the Elements',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [{
      pass: 'rollFinished',
      macro: use,
      priority: 50,
      activities: ['use'],
    }],
  },
};

export default macro;
