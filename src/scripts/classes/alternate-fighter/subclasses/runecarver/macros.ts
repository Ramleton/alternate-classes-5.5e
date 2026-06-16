import CPRMacro from 'chris-premades/macro.js';
import elderInsight from './elderInsight.js';
import endRunicMight from './endRunicMight.js';
import runeCarving from './runeCarving.js';
import runes from './runes/macros.js';
import runicMight from './runicMight.js';

const macros: CPRMacro[] = [
  runicMight,
  elderInsight,
  endRunicMight,
  runeCarving,
  ...runes,
];

export default macros;
