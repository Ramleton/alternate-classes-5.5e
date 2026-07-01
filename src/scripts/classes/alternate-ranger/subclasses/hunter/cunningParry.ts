import acBoostMacroFactory, {
  ACBoostCallback,
  duringACBoost,
  DuringACBoostCallback,
  preACBoost,
  PreACBoostCallback,
} from 'automation/acBoostMacroFactory.js';
import { getValidWeapons } from 'automation/weaponUtils.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const preCallback: PreACBoostCallback = async ({ feat, token, workflow }) => {
  if (!isQuarry(token.actor!, workflow.actor!)) return false;
  return await preACBoost({ feat, token, workflow });
};

const acBoostCallback: ACBoostCallback = async ({ feat }) => {
  return Math.max(1, feat.actor?.system.abilities.wis.mod ?? 0);
};

const duringCallback: DuringACBoostCallback = async ({
  feat,
  token,
  workflow,
  acBoostCallback,
}) => {
  const res = await duringACBoost({ feat, token, workflow, acBoostCallback });
  if (!res) return false;
  const validWeapons = getValidWeapons(token, workflow.token!, true);
  if (!validWeapons.length) return true;
  const {
    utils: { dialogUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  let selectedWeapon: Item<'weapon'> | undefined;
  const userId = socketUtils.firstOwner(token.actor, true);
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon = (await dialogUtils.selectDocumentDialog(
      `${feat.name}: Select Weapon`,
      'Select a weapon to use',
      validWeapons,
      {
        userId,
      },
    )) as Item<'weapon'> | undefined;
    if (!selectedWeapon) return true;
  }
  await workflowUtils.syntheticItemRoll(selectedWeapon, [workflow.token!], {
    consumeResources: true,
    userId,
  });
  return true;
};

export default acBoostMacroFactory({
  identifier: 'ac55eCunningParry',
  name: 'Hunter: Cunning Parry',
  preCallback,
  duringCallback,
  acBoostCallback,
});
