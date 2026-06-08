import { effectUtils } from 'chrisPremades';

async function endRunicMight(item): Promise<void> {
  const effect = effectUtils.getEffectByIdentifier(
    item.actor,
    'ac55eRunicMightEffect',
  );
  effect.delete();
}

async function workflow({ trigger: { entity: item } }) {
  await endRunicMight(item);
}

export const ac55eEndRunicMight = {
  name: 'End Runic Might',
  version: '1.3.141',
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
