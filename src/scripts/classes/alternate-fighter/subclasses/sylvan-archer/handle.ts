import { Workflow } from '@midi-qol/types/module/Workflow.js';
import handleBeguilingShot from './enchanted-shots/beguilingShot.js';
import handleEnfeeblingShot from './enchanted-shots/enfeeblingShot.js';
import handleGraspingShot from './enchanted-shots/graspingShot.js';
import handleSeveringShot from './enchanted-shots/severingShot.js';
import handleTransposingShot from './enchanted-shots/transposingShot.js';
import handleUmbralShot from './enchanted-shots/umbralShot.js';

export interface EnchantedShotData {
  item;
  workflow: Workflow;
  saveWorkflow: Workflow;
}

export type HandleEnchantedShot = (data: EnchantedShotData) => Promise<boolean>;

const handleEnchantedShot = async (
  data: EnchantedShotData,
): Promise<boolean> => {
  const { item } = data;
  switch (item.identifier) {
    case 'beguiling-shot':
      return await handleBeguilingShot(data);
    case 'enfeebling-shot':
      return await handleEnfeeblingShot(data);
    case 'grasping-shot':
      return await handleGraspingShot(data);
    case 'umbral-shot':
      return await handleUmbralShot(data);
    case 'severing-shot':
      return await handleSeveringShot(data);
    case 'transposing-shot':
      return await handleTransposingShot(data);
  }
  return false;
};

export default handleEnchantedShot;
