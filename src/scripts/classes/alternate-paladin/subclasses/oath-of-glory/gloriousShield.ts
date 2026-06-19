import acBoostMacroFactory, { ACBonusCallback, preArmorClassBoost, PreCallback } from 'automation/ACBoostMacroFactory.js';
import { getDivineFervorUses } from '../../utils/utils.js';
import { isTargetWithinAuraOfProtection } from '../utils/utils.js';

const pre: PreCallback = async ({
  feat,
  token,
  workflow,
}): Promise<boolean> => {
  const target = workflow.hitTargets.first() as Token;
  if (!isTargetWithinAuraOfProtection(feat.actor!, token, target))
    return false;
  if (!feat.system.uses!.value && !getDivineFervorUses(feat.actor!))
    return false;
  return await preArmorClassBoost({ feat, token, workflow });
};

const acBonusCallback: ACBonusCallback = async ({ feat }) => {
  return feat.actor!.system.abilities.cha.mod as number;
};

export default acBoostMacroFactory({
  name: 'Glorious Shield',
  acBonusCallback,
  preCallback: pre,
});
