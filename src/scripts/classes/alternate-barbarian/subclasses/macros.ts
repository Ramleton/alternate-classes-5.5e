import CPRMacro from 'chris-premades/macro.js';
import pathOfBloodAndIron from './path-of-blood-and-iron/macros.js';
import pathOfElementalChaos from './path-of-elemental-chaos/macros.js';
import pathOfSorcery from './path-of-sorcery/macros.js';
import pathOfTheAncestors from './path-of-the-ancestors/macros.js';
import pathOfTheBeastHeart from './path-of-the-beast-heart/macros.js';
import pathOfTheBerserker from './path-of-the-berserker/macros.js';
import pathOfTheBrute from './path-of-the-brute/macros.js';
import pathOfTheChampion from './path-of-the-champion/macros.js';
import pathOfTheLycan from './path-of-the-lycan/macros.js';

const macros: CPRMacro[] = [
  ...pathOfBloodAndIron,
  ...pathOfElementalChaos,
  ...pathOfSorcery,
  ...pathOfTheAncestors,
  ...pathOfTheBeastHeart,
  ...pathOfTheBerserker,
  ...pathOfTheBrute,
  ...pathOfTheChampion,
  ...pathOfTheLycan,
];

export default macros;
