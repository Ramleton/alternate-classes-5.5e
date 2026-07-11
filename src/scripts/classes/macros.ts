import CPRMacro from 'chris-premades/macro.js';
import alternateBarbarian from './alternate-barbarian/macros.js';
import alternateFighter from './alternate-fighter/macros.js';
import alternatePaladin from './alternate-paladin/macros.js';
import alternateRanger from './alternate-ranger/macros.js';
import alternateRogue from './alternate-rogue/macros.js';

const macros: CPRMacro[] = [
  ...alternateBarbarian,
  ...alternateFighter,
  ...alternatePaladin,
  ...alternateRanger,
  ...alternateRogue,
];

export default macros;
