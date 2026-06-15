import CPRMacro from 'chris-premades/macro.js';
import champion from './champion/macros.js';
import marksman from './marksman/macros.js';
import masterAtArms from './master-at-arms/macros.js';
import sylvanArcher from './sylvan-archer/macros.js';

const subclassMacros: CPRMacro[] = [
  ...champion,
  ...marksman,
  ...masterAtArms,
  ...sylvanArcher,
];

export default subclassMacros;
