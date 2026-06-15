import CauldronOfPlentifulResources from './chris-premades/cauldronOfPlentifulResources.js';
import TokenMagic from './token-magic/token-magic.js';

export { };

declare global {
  const chrisPremades: CauldronOfPlentifulResources;
  const TokenMagic: TokenMagic;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CONFIG: Config<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dnd5e: any;
}
