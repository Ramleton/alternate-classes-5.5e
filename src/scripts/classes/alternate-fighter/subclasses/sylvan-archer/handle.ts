import { EnchantedShotData } from '../../../../../types/alternate-classes-55e';
import handleBeguilingShot from './enchanted-shots/beguilingShot.js';
import handleBurstingShot from './enchanted-shots/burstingShot.js';
import handleEnfeeblingShot from './enchanted-shots/enfeeblingShot.js';

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
  }
  return false;
};

export default handleEnchantedShot;
