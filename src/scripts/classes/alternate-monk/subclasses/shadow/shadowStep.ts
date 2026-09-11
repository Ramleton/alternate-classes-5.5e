import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const {
    Teleport,
    utils: { itemUtils },
  } = chrisPremades;
  const animation = itemUtils.getConfig(workflow.item, 'playAnimation')
    ? 'mistyStep'
    : 'none';
  const feat = entity as Item<'feat'>;
  const monkLevel = feat.actor!.classes['alternate-monk'].system.levels;
  await Teleport.target([workflow.token!], workflow.token!, {
    range: monkLevel >= 17 ? 120 : 60,
    animation: animation,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eShadowStep',
  name: 'Way of the Shadow: Shadow Step',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
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

export default macro;
