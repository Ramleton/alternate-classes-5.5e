import CPRMacro from 'chris-premades/macro.js';
import blackguard from './blackguard/macros.js';
import oathOfConquest from './oath-of-conquest/macros.js';
import oathOfGlory from './oath-of-glory/macros.js';
import oathOfRepentance from './oath-of-repentance/macros.js';
import oathOfSplendor from './oath-of-splendor/macros.js';
import oathOfTheAncients from './oath-of-the-ancients/macros.js';
import oathOfTheThrone from './oath-of-the-throne/macros.js';
import oathOfVengeance from './oath-of-vengeance/macros.js';
import oathOfVigilance from './oath-of-vigilance/macros.js';
import oathless from './oathless/macros.js';

const macros: CPRMacro[] = [
  ...blackguard,
  ...oathOfConquest,
  ...oathOfGlory,
  ...oathOfRepentance,
  ...oathOfSplendor,
  ...oathOfTheAncients,
  ...oathOfTheThrone,
  ...oathOfVengeance,
  ...oathOfVigilance,
  ...oathless,
];

export default macros;
