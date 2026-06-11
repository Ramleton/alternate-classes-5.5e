import CPRMacro from '../../../../../types/chris-premades/macro.js';
import enfeeblingShotMacro from './enchanted-shots/enfeeblingShotEffect.js';
import graspingShotEffectMovedMacro from './enchanted-shots/graspingShotEffectMoved.js';
import graspingShotEffectResetMacro from './enchanted-shots/graspingShotEffectReset.js';
import piercingShotMacro from './enchanted-shots/piercingShot.js';
import enchantedShotSaveMacro from './enchantedShotSave.js';

const sylvanArcherMacros: CPRMacro[] = [
  enchantedShotSaveMacro,
  enfeeblingShotMacro,
  graspingShotEffectMovedMacro,
  graspingShotEffectResetMacro,
  piercingShotMacro,
];

export default sylvanArcherMacros;
