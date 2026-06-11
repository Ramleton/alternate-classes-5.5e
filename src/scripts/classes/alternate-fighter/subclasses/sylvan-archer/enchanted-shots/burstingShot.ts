import { HandleEnchantedShot } from '../handle';

const handleBurstingShot: HandleEnchantedShot = async (_data) => {
  return true; // The saving throw handles it fully
};

export default handleBurstingShot;
