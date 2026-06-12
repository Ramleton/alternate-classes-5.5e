import CPRMacro from 'chris-premades/macro.js';

async function unsetFlag({ trigger: { entity: item } }) {
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.unsetFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.enchantedShot',
  );
}

const macro: CPRMacro = {
  name: 'Enchanted Shot - Reset',
  identifier: 'ac55eEnchantedShotReset',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: unsetFlag,
        priority: 990,
      },
    ],
  },
};

export default macro;
