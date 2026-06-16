import CPRMacro from 'chris-premades/macro.js';
import champion from './champion/macros.js';
import knightErrant from './knight-errant/macros.js';
import marksman from './marksman/macros.js';
import masterAtArms from './master-at-arms/macros.js';
import ronin from './ronin/macros.js';
import runecarver from './runecarver/macros.js';
import shadowdancer from './shadowdancer/macros.js';
import sylvanArcher from './sylvan-archer/macros.js';

const subclassMacros: CPRMacro[] = [
  ...champion,
  ...knightErrant,
  ...marksman,
  ...masterAtArms,
  ...ronin,
  ...runecarver,
  ...shadowdancer,
  ...sylvanArcher,
];

export default subclassMacros;
