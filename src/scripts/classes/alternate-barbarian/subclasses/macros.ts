import CPRMacro from 'chris-premades/macro.js';
import pathOfBloodAndIron from './path-of-blood-and-iron/macros.js';
import pathOfTheAncestors from './path-of-the-ancestors/macros.js';
import pathOfTheBeastHeart from './path-of-the-beast-heart/macros.js';
import pathOfTheBerserker from './path-of-the-berserker/macros.js';
import pathOfTheBrute from './path-of-the-brute/macros.js';
import pathOfTheChampion from './path-of-the-champion/macros.js';

const macros: CPRMacro[] = [
  ...pathOfBloodAndIron,
  ...pathOfTheAncestors,
  ...pathOfTheBeastHeart,
  ...pathOfTheBerserker,
  ...pathOfTheBrute,
  ...pathOfTheChampion,
];

export default macros;
