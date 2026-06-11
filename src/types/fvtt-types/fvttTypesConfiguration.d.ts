export { };

declare module 'fvtt-types/configuration' {
  interface DataModelConfig {
    Item: {
      feat: typeof FeatSystemData;
      weapon: typeof WeaponSystemData;
    };
  }
}
