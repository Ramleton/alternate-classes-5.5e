import { runActivity } from 'automation/utils.js';
import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../../class-features/handling/eldritchBlastHandlerFactory.js';

const preCheck: EldritchBlastPreCheck = async ({ workflow }) => {
  return !!workflow.hitTargets.size;
};

const handle: EldritchBlastHandler = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const target = workflow.hitTargets.first() as Token;
  if (!target.actor) return;
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const terribleDelights = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eTerribleDelights',
  );
  if (!terribleDelights && target.actor.system.traits.ci.value.has('charmed'))
    return;
  await runActivity(feat, 'apply', [target]);
};

addEldritchBlastHandler({
  pass: 'attackRollComplete',
  cprIdentifier: 'ac55eBeguilingBlast',
  exclusive: false,
  automatic: true,
  preCheck,
  handle,
});
