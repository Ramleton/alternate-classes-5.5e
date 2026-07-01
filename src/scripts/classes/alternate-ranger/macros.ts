import CPRMacro from '../../../types/chris-premades/macro.js';
import classFeatures from './class-features/macros.js';
import knacks from './knacks/macros.js';
import subclasses from './subclasses/macros.js';

const classMacros: CPRMacro[] = [...classFeatures, ...subclasses, ...knacks];

export default classMacros;
