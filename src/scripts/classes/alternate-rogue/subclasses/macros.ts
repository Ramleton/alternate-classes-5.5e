import CPRMacro from '../../../../types/chris-premades/macro.js';

import assassin from './assassin/macros.js';
import burglar from './burglar/macros.js';
import investigator from './investigator/macros.js';

const macros: CPRMacro[] = [...assassin, ...burglar, ...investigator];

export default macros;
