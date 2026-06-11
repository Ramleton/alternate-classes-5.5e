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
    };
  }
}
