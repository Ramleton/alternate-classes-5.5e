import CPRMacro from 'chris-premades/macro.js';
import { isRaging } from '../../utils/rageUtils.js';

export const hasDivineAlignmentEvil = (
  actor: Actor5e,
  activatingRage = false,
): boolean => {
  const {
    utils: { itemUtils },
  } = chrisPremades;
  return (
    !!itemUtils.getItemByIdentifier(actor, 'ac55eZealotDivineAlignmentEvil') &&
    (activatingRage || isRaging(actor))
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eZealotDivineAlignmentEvil',
  name: 'Path of the Zealot: Divine Alignment: Evil',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
