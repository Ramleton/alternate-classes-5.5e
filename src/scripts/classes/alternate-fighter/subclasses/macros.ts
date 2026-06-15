import CPRMacro from 'chris-premades/macro.js';
import champion from './champion/macros.js';
import marksman from './marksman/macros.js';
import sylvanArcher from './sylvan-archer/macros.js';

const subclassMacros: CPRMacro[] = [
  ...champion,
  ...marksman,
  ...sylvanArcher,
];

export default subclassMacros;
