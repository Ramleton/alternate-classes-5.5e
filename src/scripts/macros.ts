import CPRMacro from '../types/chris-premades/macro.js';
import classMacros from './classes/macros.js';
import exploitMacros from './exploits/macros.js';

const macros: CPRMacro[] = [
  ...classMacros,
  ...exploitMacros,
];

export default macros;
