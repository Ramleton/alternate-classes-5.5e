import acBoostMacroFactory, {
  ACBoostCallback,
  PreACBoostCallback,
} from 'automation/acBoostMacroFactory.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const preCallback: PreACBoostCallback = async ({ feat, workflow }) => {
  const {
    utils: { actorUtils, dialogUtils, socketUtils, tokenUtils },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor!)) return false;
  const target = workflow.hitTargets.first()! as Token;
  if (tokenUtils.getDistance(workflow.token!, target) > 10) return false;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  return selection;
};

const acBoostCallback: ACBoostCallback = async ({ feat }) => {
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return 0;
  const {
    utils: { rollUtils },
  } = chrisPremades;
  const res = await rollUtils.rollDice(`1${exploitDie}`, { chatMessage: true });
  return res.roll.total;
};

export default acBoostMacroFactory({
  identifier: 'ac55ePathOfLycanthropyTail',
  name: 'Path of Lycanthropy: Tail',
  preCallback,
  acBoostCallback,
});
