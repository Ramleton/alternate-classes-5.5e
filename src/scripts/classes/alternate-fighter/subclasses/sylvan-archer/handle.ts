import { Workflow } from '@midi-qol/types/module/Workflow.js';
import handleBeguilingShot from './enchanted-shots/beguilingShot.js';
import handleBurstingShot from './enchanted-shots/burstingShot.js';
import handleEnfeeblingShot from './enchanted-shots/enfeeblingShot.js';
import handleGraspingShot from './enchanted-shots/graspingShot.js';

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
    case 'bursting-shot':
      return await handleBurstingShot(data);
    case 'enfeebling-shot':
      return await handleEnfeeblingShot(data);
    case 'grasping-shot':
      return await handleGraspingShot(data);
  }
  return false;
};

export default handleEnchantedShot;
