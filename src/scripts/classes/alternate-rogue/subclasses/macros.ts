import CPRMacro from '../../../../types/chris-premades/macro.js';

import assassin from './assassin/macros.js';
import burglar from './burglar/macros.js';

const macros: CPRMacro[] = [...assassin, ...burglar];

export default macros;
