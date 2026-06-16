import CPRMacro from 'chris-premades/macro.js';
import elderInsight from './elderInsight.js';
import endRunicMight from './endRunicMight.js';
import runes from './runes/macros.js';
import runicMight from './runicMight.js';

const macros: CPRMacro[] = [
  runicMight,
  elderInsight,
  endRunicMight,
  ...runes,
];

export default macros;
