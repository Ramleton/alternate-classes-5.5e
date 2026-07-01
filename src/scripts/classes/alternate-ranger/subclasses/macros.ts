import CPRMacro from 'chris-premades/macro.js';
import deepStalker from './deep-stalker/macros.js';
import feyWanderer from './fey-wanderer/macros.js';
import hunter from './hunter/macros.js';
import monsterSlayer from './monster-slayer/macros.js';
import planarWarden from './planar-warden/macros.js';

const macros: CPRMacro[] = [
  ...deepStalker,
  ...feyWanderer,
  ...hunter,
  ...monsterSlayer,
  ...planarWarden,
];

export default macros;
