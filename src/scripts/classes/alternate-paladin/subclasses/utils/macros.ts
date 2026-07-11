import CPRMacro from 'chris-premades/macro.js';
import auraDamagedInsteadFactory from './auraDamagedInsteadFactory.js';
import subclassSmiteFactory from './subclassSmiteFactory.js';
import utils from './utils.js';

const macros: CPRMacro[] = [
  auraDamagedInsteadFactory,
  subclassSmiteFactory,
  utils,
];

export default macros;
