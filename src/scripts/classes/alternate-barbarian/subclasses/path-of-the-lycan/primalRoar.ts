import CPRMacro from 'chris-premades/macro.js';

export const hasPrimalRoar = (actor: Actor5e): boolean => {
  const {
    utils: { itemUtils },
  } = chrisPremades;
  return !!itemUtils.getItemByIdentifier(actor, 'ac55ePrimalRoar');
};

const macro: CPRMacro = {
  identifier: 'ac55ePrimalRoar',
  name: 'Path of the Lycan: Primal Roar',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
