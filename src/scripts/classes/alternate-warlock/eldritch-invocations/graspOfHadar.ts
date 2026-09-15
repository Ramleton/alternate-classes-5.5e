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
  const ray = new foundry.canvas.geometry.Ray(target.center, token.center);
  const targetSize = actorUtils.getSize(target.actor!, false);
  const divisor = targetSize - 2;
  await tokenUtils.moveTokenAlongRay(target, ray, 10 / divisor);
};

addEldritchBlastHandler({
  pass: 'attackRollComplete',
  cprIdentifier: 'ac55eGraspOfHadar',
  exclusive: false,
  preCheck,
  handle,
});
