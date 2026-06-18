import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { spendDivineFervor } from '../../utils/utils.js';

const replaceD20: MacroFunction = async (args) => {
  const { trigger: { actor, roll } } = args;
  if (roll.data.abilityId !== 'cha')
    return;
  const { utils: {
    dialogUtils,
    effectUtils,
    rollUtils,
    socketUtils,
  } } = chrisPremades;
  if (!effectUtils.getEffectByIdentifier(actor!, 'ac55eAvatarOfGloryEffect'))
    return;
  if (roll.hasDisadvantage) {
    if (roll.d20.results.every(r => r.result === 20))
      return;
  }
  else {
    if (roll.d20.results.some(r => r.result === 20))
      return;
  }
  const selection = await dialogUtils.confirm(
    'Avatar of Glory',
    'Change D20 result to 20?',
    { userId: socketUtils.firstOwner(actor, true) },
  );
  if (!selection)
    return;
  await spendDivineFervor(actor!);
  return await rollUtils.replaceD20(roll, 20);
};

const macro: CPRMacro = {
  identifier: 'ac55eAvatarOfGlory',
  name: 'Avatar of Glory',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  skill: [{
    pass: 'bonus',
    macro: replaceD20,
    priority: 100,
  }],
};

export default macro;
