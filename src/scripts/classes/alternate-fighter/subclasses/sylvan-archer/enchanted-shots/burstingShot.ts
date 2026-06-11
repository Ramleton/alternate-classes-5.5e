import { HandleEnchantedShot } from '../handle.js';

const handleBurstingShot: HandleEnchantedShot = async (_data) => {
  return true; // The saving throw handles it fully
};

export default handleBurstingShot;
