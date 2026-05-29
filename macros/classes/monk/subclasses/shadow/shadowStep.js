import { Teleport } from '../../../lib/teleport.js';
import { itemUtils } from '../../../utils.js';
async function use({ trigger: { entity: item }, workflow }) {
  const altMonk = itemUtils.getItemByIdentifier(item.actor, 'altMonk');
  if (!altMonk) return;
  const altMonkLevels = altMonk.system.levels;
  const animation = itemUtils.getConfig(workflow.item, 'playAnimation')
    ? 'mistyStep'
    : 'none';
  await Teleport.target(
    [workflow.token],
    workflow.token,
    {
      range: altMonkLevels >= 17 ? 120 : 60,
      animation: animation,
    },
  );
}
export let shadowStep = {
  name: 'Shadow Step',
  version: '1.1.0',
  hasAnimation: true,
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: use,
        priority: 50,
      },
    ],
  },
  config: [
    {
      value: 'playAnimation',
      label: 'CHRISPREMADES.Config.PlayAnimation',
      type: 'checkbox',
      default: true,
      category: 'animation',
    },
  ],
};
