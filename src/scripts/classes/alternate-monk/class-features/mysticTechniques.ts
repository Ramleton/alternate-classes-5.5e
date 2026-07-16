import CPRMacro from 'chris-premades/macro.js';
import mysticTechniqueHandlerFactory from './handling/mysticTechniqueHandlerFactory.js';

const macro: CPRMacro = {
  identifier: 'ac55eMysticTechniques',
  name: 'Mystic Techniques',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      mysticTechniqueHandlerFactory({ pass: 'attackRollComplete' }),
      mysticTechniqueHandlerFactory({ pass: 'targetAttackRollComplete' }),
      mysticTechniqueHandlerFactory({ pass: 'targetDamageRollComplete' }),
    ],
  },
};

export default macro;
