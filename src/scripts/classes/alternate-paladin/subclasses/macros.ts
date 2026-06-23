import CPRMacro from 'chris-premades/macro.js';
import oathOfConquest from './oath-of-conquest/macros.js';
import oathOfGlory from './oath-of-glory/macros.js';
import oathOfSplendor from './oath-of-splendor/macros.js';
import oathOfTheAncients from './oath-of-the-ancients/macros.js';
import oathOfTheThrone from './oath-of-the-throne/macros.js';

const macros: CPRMacro[] = [
  ...oathOfTheAncients,
  ...oathOfConquest,
  ...oathOfGlory,
  ...oathOfSplendor,
  ...oathOfTheThrone,
];

export default macros;
