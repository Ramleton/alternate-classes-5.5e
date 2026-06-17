import CharacterSystemData from './CharacterSystemData.js';
import ClassSystemData from './ClassSystemData.js';
import EquipmentSystemData from './EquipmentSystemData.js';
import FeatSystemData from './FeatSystemData.js';
import WeaponSystemData from './WeaponSystemData.js';
export { };

declare module 'fvtt-types/configuration' {
  interface ConfiguredActor<SubType extends Actor.SubType> {
    document: Actor5e<SubType>;
  }
  interface DataModelConfig {
    Actor: {
      character: typeof CharacterSystemData;
    };
    Item: {
      feat: typeof FeatSystemData;
      weapon: typeof WeaponSystemData;
      class: typeof ClassSystemData;
      equipment: typeof EquipmentSystemData;
    };
  }
}
