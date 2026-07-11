import CPRMacro from 'chris-premades/macro.js';
import classFeatures from './class-features/macros.js';
import subclasses from './subclasses/macros.js';

const macros: CPRMacro[] = [...classFeatures, ...subclasses];

export default macros;
