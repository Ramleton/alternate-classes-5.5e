import { runActivity } from 'automation/utils.js';
import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../../class-features/handling/eldritchBlastHandlerFactory.js';

const preCheck: EldritchBlastPreCheck = async ({ ditem }) => {
  return ditem!.damageDetail.some((d) => d.type === 'cold');
};

const handle: EldritchBlastHandler = async ({
  trigger: { token },
  feature,
}) => {
  await runActivity(feature, 'apply', [token]);
};

addEldritchBlastHandler({
  pass: 'applyDamage',
  cprIdentifier: 'ac55eOceanicGrasp',
  exclusive: false,
  automatic: true,
  preCheck,
  handle,
});
