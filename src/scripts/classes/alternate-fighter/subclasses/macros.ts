import CPRMacro from 'chris-premades/macro.js';
import champion from './champion/macros.js';
import sylvanArcher from './sylvan-archer/macros.js';

const subclassMacros: CPRMacro[] = [
  ...champion,
  ...sylvanArcher,
];

export default subclassMacros;
