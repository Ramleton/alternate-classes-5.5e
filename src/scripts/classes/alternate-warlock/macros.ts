import CPRMacro from 'chris-premades/macro.js';
import classFeatures from './class-features/macros.js';
import eldritchInvocations from './eldritch-invocations/macros.js';

const macros: CPRMacro[] = [...classFeatures, ...eldritchInvocations];

export default macros;
