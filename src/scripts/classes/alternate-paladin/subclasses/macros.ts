import CPRMacro from 'chris-premades/macro.js';
import oathOfConquest from './oath-of-conquest/macros.js';
import oathOfGlory from './oath-of-glory/macros.js';
import oathOfTheAncients from './oath-of-the-ancients/macros.js';

const macros: CPRMacro[] = [
  ...oathOfTheAncients,
  ...oathOfConquest,
  ...oathOfGlory,
];

export default macros;
