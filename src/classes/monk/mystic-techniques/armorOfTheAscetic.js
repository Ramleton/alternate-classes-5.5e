import {
  effectUtils,
  itemUtils,
} from 'chrisPremades';

async function use({ trigger: { entity: item }, workflow }) {
  let effectData = {
    name: workflow.item.name,
    img: workflow.item.img,
    origin: workflow.item.uuid,
    duration: itemUtils.convertDuration(workflow.item),
    flags: {
      dae: {
        specialDuration: ['longRest', 'shortRest'],
      },
    },
  };
  effectUtils.addMacro(effectData, 'midi.actor', [
    'ac55eArmorOfTheAsceticSafe',
  ]);
  await effectUtils.createEffect(item.actor, effectData, {
    identifier: 'ac55eArmorOfTheAsceticSafe',
    rules: 'modern',
  });
}

export let ac55eArmorOfTheAscetic = {
  name: 'Armor of the Ascetic',
  version: '1.2.29',
  rules: 'modern',
  hasAnimation: true,
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: use,
        priority: 50,
        activities: ['useShortRest'],
      },
      {
        pass: 'rollFinished',
        macro: use,
        priority: 50,
        activities: ['useLongRest'],
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
