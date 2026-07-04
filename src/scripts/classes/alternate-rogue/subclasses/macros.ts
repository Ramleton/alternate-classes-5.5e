import CPRMacro from '../../../../types/chris-premades/macro.js';

import assassin from './assassin/macros.js';
import burglar from './burglar/macros.js';
import investigator from './investigator/macros.js';
import mastermind from './mastermind/macros.js';
import phantom from './phantom/macros.js';

const macros: CPRMacro[] = [
  ...assassin,
  ...burglar,
  ...investigator,
  ...mastermind,
  ...phantom,
];

export default macros;
