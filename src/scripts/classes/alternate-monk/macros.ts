import CPRMacro from 'chris-premades/macro.js';
import classFeatures from './class-features/macros.js';
import mysticTechniques from './mystic-techniques/macros.js';
import subclasses from './subclasses/macros.js';

const macros: CPRMacro[] = [
  ...classFeatures,
  ...mysticTechniques,
  ...subclasses,
];

export default macros;
