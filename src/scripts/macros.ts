import CPRMacro from '../types/chris-premades/macro.js';
import classMacros from './classes/macros.js';
import exploitMacros from './exploits/macros.js';
import { injectAC55ePropertiesInWorkflow } from './macroUtils/ac55ePropertyInjection.js';

const macros: CPRMacro[] = injectAC55ePropertiesInWorkflow([
  ...classMacros,
  ...exploitMacros,
]);

export default macros;
