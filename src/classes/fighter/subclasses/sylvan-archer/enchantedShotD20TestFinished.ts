import { genericUtils } from 'chrisPremades';
import AlternateClasses55e from '../../../../types/alternate-classes-55e';

async function unsetFlag({ trigger: { entity: item } }) {
  const altClassesModule = game
    .modules.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule)
    return;
  await genericUtils.unsetFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.enchantedShot',
  );
}

export const ac55eEnchantedShotD20TestFinished = {
  name: 'D20 Test Finished - Enchanted Shot',
  version: '1.3.141',
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
