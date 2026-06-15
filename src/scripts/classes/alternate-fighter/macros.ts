import CPRMacro from 'chris-premades/macro.js';
import classFeatureMacros from './class-features/macros.js';
import subclassMacros from './subclasses/macros.js';

const alternateFighterMacros: CPRMacro[] = [
  ...classFeatureMacros,
  ...subclassMacros,
];

export default alternateFighterMacros;
