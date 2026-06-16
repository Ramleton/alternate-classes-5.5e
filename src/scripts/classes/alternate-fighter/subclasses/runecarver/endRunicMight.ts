import CPRMacro from 'chris-premades/macro.js';

async function workflow({ trigger: { entity: item } }) {
  const { utils: { effectUtils } } = chrisPremades;
  const effect = effectUtils.getEffectByIdentifier(
    item.actor,
    'ac55eRunicMightEffect',
  );
  await effect.delete();
}
const macro: CPRMacro = {
  identifier: 'ac55eEndRunicMight',
  name: 'End Runic Might',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: workflow,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
