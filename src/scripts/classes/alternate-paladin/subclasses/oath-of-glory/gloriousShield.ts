import acBoostMacroFactory, {
  ACBoostCallback,
  preACBoost,
  PreACBoostCallback,
} from 'automation/acBoostMacroFactory.js';
import { getDivineFervorUses } from '../../utils/utils.js';
import { isTargetWithinAuraOfProtection } from '../utils/utils.js';

const pre: PreACBoostCallback = async ({
  feat,
  token,
  workflow,
}): Promise<boolean> => {
  const target = workflow.hitTargets.first() as Token;
  if (!isTargetWithinAuraOfProtection(feat.actor!, token, target)) return false;
  if (!feat.system.uses!.value && !getDivineFervorUses(feat.actor!))
    return false;
  return await preACBoost({ feat, token, workflow });
};

const acBonusCallback: ACBoostCallback = async ({ feat }) => {
  return feat.actor!.system.abilities.cha.mod as number;
};

export default acBoostMacroFactory({
  name: 'Glorious Shield',
  acBoostCallback: acBonusCallback,
  preCallback: pre,
});
