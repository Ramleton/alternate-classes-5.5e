import { runActivity } from 'automation/utils.js';
import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../../class-features/handling/eldritchBlastHandlerFactory.js';

const preCheck: EldritchBlastPreCheck = async ({ ditem }) => {
  return ditem!.damageDetail.some((d) => d.type === 'cold');
};

const handle: EldritchBlastHandler = async ({ trigger: { entity, token } }) => {
  const feat = entity as Item<'feat'>;
  await runActivity(feat, 'apply', [token]);
};

addEldritchBlastHandler({
  pass: 'damageRollComplete',
  cprIdentifier: 'ac55eOceanicGrasp',
  exclusive: false,
  automatic: true,
  preCheck,
  handle,
});
