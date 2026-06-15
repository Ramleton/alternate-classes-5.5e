import CPRMacro from 'chris-premades/macro.js';
import classFeature from './class-features/macros.js';
import subclass from './subclasses/macros.js';

const alternateFighterMacros: CPRMacro[] = [
  ...classFeature,
  ...subclass,
];

export default alternateFighterMacros;
