import CPRMacro from 'chris-premades/macro.js';
import deepStalker from './deep-stalker/macros.js';
import feyWanderer from './fey-wanderer/macros.js';

const macros: CPRMacro[] = [...deepStalker, ...feyWanderer];

export default macros;
