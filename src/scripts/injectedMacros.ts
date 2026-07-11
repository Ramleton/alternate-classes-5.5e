import CPRMacro from 'chris-premades/macro.js';
import { injectAC55ePropertiesInWorkflow } from './macroUtils/ac55ePropertyInjection.js';
import macros from './macros.js';

const injectedMacros: CPRMacro[] = injectAC55ePropertiesInWorkflow(macros);

export default injectedMacros;
