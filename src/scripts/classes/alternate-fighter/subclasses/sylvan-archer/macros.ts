import CPRMacro from '../../../../../types/chris-premades/macro.js';
import banishingShotMacro from './enchanted-shots/banishingShot.js';
import burstingShotMacro from './enchanted-shots/burstingShot.js';
import enfeeblingShotMacro from './enchanted-shots/enfeeblingShotEffect.js';
import graspingShotEffectMovedMacro from './enchanted-shots/graspingShotEffectMoved.js';
import graspingShotEffectResetMacro from './enchanted-shots/graspingShotEffectReset.js';
import piercingShotMacro from './enchanted-shots/piercingShot.js';
import enchantedShotPromptMacro from './enchantedShotPrompt.js';
import enchantedShotResetMacro from './enchantedShotReset.js';
import enchantedShotSaveMacro from './enchantedShotSave.js';

const sylvanArcherMacros: CPRMacro[] = [
  enchantedShotSaveMacro,
  enchantedShotPromptMacro,
  enchantedShotResetMacro,
  enfeeblingShotMacro,
  graspingShotEffectMovedMacro,
  graspingShotEffectResetMacro,
  piercingShotMacro,
  banishingShotMacro,
  burstingShotMacro,
];

export default sylvanArcherMacros;
