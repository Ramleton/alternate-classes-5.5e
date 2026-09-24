import { runActivity } from 'automation/utils.js';
import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../../class-features/handling/eldritchBlastHandlerFactory.js';

const preCheck: EldritchBlastPreCheck = async ({ feature, ditem }) => {
  if (!ditem || ditem.damageDetail.some((d) => d.type === 'psychic'))
    return false;
  return !!feature.system.uses!.value;
};

const handle: EldritchBlastHandler = async ({ workflow, feature }) => {
  const target = workflow.hitTargets.first() as Token;
  await runActivity(feature, 'apply', [target]);
};

addEldritchBlastHandler({
  pass: 'applyDamage',
  cprIdentifier: 'ac55eMentalLance',
  exclusive: false,
  automatic: true,
  preCheck,
  handle,
});
