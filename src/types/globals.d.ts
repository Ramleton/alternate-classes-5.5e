import CauldronOfPlentifulResources from './chris-premades/cauldronOfPlentifulResources';

export { };

declare global {
  const chrisPremades: CauldronOfPlentifulResources;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CONFIG: Config<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dnd5e: any;
}
