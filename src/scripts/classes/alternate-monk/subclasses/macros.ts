import CPRMacro from 'chris-premades/macro.js';
import astralWarrior from './astral-warrior/macros.js';
import drunkenFist from './drunken-fist/macros.js';
import harmony from './harmony/macros.js';
import openHand from './open-hand/macros.js';

const macros: CPRMacro[] = [
  ...astralWarrior,
  ...drunkenFist,
  ...harmony,
  ...openHand,
];

export default macros;
