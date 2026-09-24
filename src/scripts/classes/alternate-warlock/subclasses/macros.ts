import CPRMacro from 'chris-premades/macro.js';
import archfeyPatron from './archfey-patron/macros.js';
import theDeepOnePatron from './the-deep-one-patron/macros.js';
import theFiend from './the-fiend/macros.js';

const macros: CPRMacro[] = [...archfeyPatron, ...theDeepOnePatron, ...theFiend];

export default macros;
