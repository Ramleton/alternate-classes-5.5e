import CPRMacro from '../../types/chris-premades/macro.js';
import fighter from './alternate-fighter/macros.js';
import paladin from './alternate-paladin/macros.js';

const classMacros: CPRMacro[] = [
  ...fighter,
  ...paladin,
];

export default classMacros;
