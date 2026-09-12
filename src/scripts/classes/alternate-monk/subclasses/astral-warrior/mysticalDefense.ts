import CPRMacro from 'chris-premades/macro.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';
import { EffectData } from 'types/effects.js';
import { MysticTechniqueHandler } from '../../class-features/handling/mysticTechniqueHandlerFactory.js';

export const handleMysticalDefense: MysticTechniqueHandler = async ({
  technique,
}) => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const martialArtsFormula = (
    technique.actor!.system.scale['alternate-monk'][
      'martial-arts'
    ] as ScaleValueTypeDice
  ).formula;
  const effectData: EffectData = {
    name: 'Mystical Defense: Damage Bonus',
    icon: technique.img!,
    duration: { rounds: 2 },
    origin: '',
    flags: {},
    changes: [
      {
        key: 'flags.automated-conditions-5e.damage.bonus',
        mode: 0,
        value: `${martialArtsFormula}; once; optin; description='Your next Unarmed Strike deals bonus damage equal to your Martial Arts Die.';`,
        priority: 0,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(technique.actor!, effectData);
};

const macro: CPRMacro = {
  name: 'Way of the Astral Warrior: Mystical Defense',
  version: '1.0.0',
  rules: 'modern',
  identifier: 'ac55eMysticalDefense',
  source: 'Alternate Classes 5.5e',
};

export default macro;
