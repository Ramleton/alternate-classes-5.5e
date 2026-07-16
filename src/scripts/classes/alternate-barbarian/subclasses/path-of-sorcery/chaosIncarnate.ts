import CPRMacro from 'chris-premades/macro.js';

export const hasChaosIncarnate = (actor: Actor5e): boolean => {
  const {
    utils: { itemUtils },
  } = chrisPremades;
  return !!itemUtils.getItemByIdentifier(actor, 'ac55eChaosIncarnate');
};

const macro: CPRMacro = {
  identifier: 'ac55eChaosIncarnate',
  name: 'Path of Sorcery: Chaos Incarnate',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
