import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../class-features/handling/eldritchBlastHandlerFactory.js';

const preCheck: EldritchBlastPreCheck = async ({ workflow }) => {
  return !!workflow.hitTargets.size;
};

const handle: EldritchBlastHandler = async ({
  trigger: { token },
  workflow,
}) => {
  const {
    utils: { actorUtils, tokenUtils },
  } = chrisPremades;
  const target = workflow.hitTargets.first() as Token;
  const targetSize = actorUtils.getSize(target.actor!, false);
  const divisor = targetSize - 2;
  await tokenUtils.pushToken(token, target, 10 / divisor);
};

addEldritchBlastHandler({
  pass: 'attackRollComplete',
  cprIdentifier: 'ac55eRepellingBlast',
  exclusive: false,
  preCheck,
  handle,
});
