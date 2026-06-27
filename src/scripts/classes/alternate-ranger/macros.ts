import CPRMacro from '../../../types/chris-premades/macro.js';
import classFeatures from './class-features/macros.js';
import knacks from './knacks/macros.js';

const classMacros: CPRMacro[] = [...classFeatures, ...knacks];

export default classMacros;
