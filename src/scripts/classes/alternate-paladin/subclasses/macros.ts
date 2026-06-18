import CPRMacro from 'chris-premades/macro.js';
import oathOfConquest from './oath-of-conquest/macros.js';
import oathOfTheAncients from './oath-of-the-ancients/macros.js';

const macros: CPRMacro[] = [
  ...oathOfTheAncients,
  ...oathOfConquest,
];

export default macros;
