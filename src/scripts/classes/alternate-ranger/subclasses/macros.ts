import CPRMacro from 'chris-premades/macro.js';
import deepStalker from './deep-stalker/macros.js';
import feyWanderer from './fey-wanderer/macros.js';
import hunter from './hunter/macros.js';

const macros: CPRMacro[] = [...deepStalker, ...feyWanderer, ...hunter];

export default macros;
