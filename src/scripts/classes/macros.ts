import CPRMacro from '../../types/chris-premades/macro.js';
import fighter from './alternate-fighter/macros.js';
import paladin from './alternate-paladin/macros.js';
import ranger from './alternate-ranger/macros.js';

const classMacros: CPRMacro[] = [
  ...fighter,
  ...paladin,
  ...ranger,
];

export default classMacros;
