import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';

const unsetFlag: MacroFunction = async ({ trigger: { entity: item } }) => {
  const feat = item as Item<'feat'>;
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.unsetFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.elderInsight',
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eElderInsight',
  name: 'Elder Insight: Unset Invocations',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
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

export default macro;
