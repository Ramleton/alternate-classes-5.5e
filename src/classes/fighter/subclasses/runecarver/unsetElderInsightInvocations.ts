import { genericUtils } from 'chrisPremades';

async function unsetFlag({ trigger: { entity: item } }) {
  await genericUtils.unsetFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.runeCarver.elderInsight',
  );
}

export const ac55eUnsetElderInsightInvocations = {
  name: 'Unset Elder Insight Invocations',
  version: '1.3.141',
  rules: 'modern',
  rest: [
    {
      pass: 'short',
      macro: unsetFlag,
      priority: 990,
    },
    {
      pass: 'long',
      macro: unsetFlag,
      priority: 990,
    },
  ],
};
