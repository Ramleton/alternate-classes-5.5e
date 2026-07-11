import CPRMacro from '../../types/chris-premades/macro.js';
import barbarian from './alternate-barbarian/macros.js';
import fighter from './alternate-fighter/macros.js';
import paladin from './alternate-paladin/macros.js';
import ranger from './alternate-ranger/macros.js';
import rogue from './alternate-rogue/macros.js';

const classMacros: CPRMacro[] = [
  ...barbarian,
  ...fighter,
  ...paladin,
  ...ranger,
  ...rogue,
];

export default classMacros;
