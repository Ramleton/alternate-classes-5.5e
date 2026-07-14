import CPRMacro from 'chris-premades/macro.js';
import pathOfBloodAndIron from './path-of-blood-and-iron/macros.js';
import pathOfTheAncestors from './path-of-the-ancestors/macros.js';
import pathOfTheBeastHeart from './path-of-the-beast-heart/macros.js';
import pathOfTheBerserker from './path-of-the-berserker/macros.js';

const macros: CPRMacro[] = [
  ...pathOfBloodAndIron,
  ...pathOfTheAncestors,
  ...pathOfTheBeastHeart,
  ...pathOfTheBerserker,
];

export default macros;
