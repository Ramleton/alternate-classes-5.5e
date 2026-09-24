import CPRMacro from 'chris-premades/macro.js';
// Adjust relative path to where your handler factory file lives
import handlerFactory from './handling/eldritchBlastHandlerFactory.js';

const macro: CPRMacro = {
  identifier: 'ac55eEldritchBlast',
  name: 'Alternate Warlock: Eldritch Blast',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      handlerFactory({ pass: 'postAttackRoll', priority: 10 }),
      handlerFactory({ pass: 'attackRollComplete', priority: 10 }),
      handlerFactory({ pass: 'targetAttackRollComplete', priority: 10 }),
      handlerFactory({ pass: 'damageRollComplete', priority: 10 }),
      handlerFactory({ pass: 'targetDamageRollComplete', priority: 10 }),
      handlerFactory({ pass: 'applyDamage', priority: 10 }),
    ],
  },
};

export default macro;
