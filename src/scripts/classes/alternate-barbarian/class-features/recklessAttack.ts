import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';

const prompt: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (workflow.advantage) return;
  const {
    utils: { dialogUtils, effectUtils, socketUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  if (effectUtils.getEffectByIdentifier(feat.actor!, 'ac55eRecklessAttack'))
    return;
  const userId = socketUtils.firstOwner(feat, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;
  const effectData: EffectData = {
    name: feat.name,
    icon: feat.img!,
    duration: { rounds: 2 },
    origin: feat.uuid!,
    flags: {
      dae: {
        specialDuration: ['turnStartSource'],
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eRecklessAttack',
        },
      },
    },
    changes: [
      {
        key: 'flags.automated-conditions-5e.attack.advantage',
        mode: 0,
        value: 'ability.str',
        priority: 0,
      },
      {
        key: 'flags.automated-conditions-5e.grants.attack.advantage',
        mode: 0,
        value: '1',
        priority: 0,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(feat.actor!, effectData);
};

const macro: CPRMacro = {
  identifier: 'ac55eRecklessAttack',
  name: 'Reckless Attack',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'preAttackRollConfig',
        macro: prompt,
        priority: 0,
      },
    ],
  },
};

export default macro;
