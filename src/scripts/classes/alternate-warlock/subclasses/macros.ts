import CPRMacro from 'chris-premades/macro.js';
import archfeyPatron from './archfey-patron/macros.js';
import deepOnePatron from './deep-one-patron/macros.js';
import fiend from './fiend/macros.js';
import greatOldOne from './great-old-one/macros.js';

const macros: CPRMacro[] = [
  ...archfeyPatron,
  ...deepOnePatron,
  ...fiend,
  ...greatOldOne,
];

export default macros;
