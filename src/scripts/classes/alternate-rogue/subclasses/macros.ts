import CPRMacro from 'chris-premades/macro.js';
import assassin from './assassin/macros.js';
import burglar from './burglar/macros.js';
import investigator from './investigator/macros.js';
import mastermind from './mastermind/macros.js';
import phantom from './phantom/macros.js';
import psiknife from './psiknife/macros.js';
import scout from './scout/macros.js';
import swashbuckler from './swashbuckler/macros.js';

const macros: CPRMacro[] = [
  ...assassin,
  ...burglar,
  ...investigator,
  ...mastermind,
  ...phantom,
  ...psiknife,
  ...scout,
  ...swashbuckler,
];

export default macros;
