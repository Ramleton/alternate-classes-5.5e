import { runActivity } from 'automation/utils.js';
import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../class-features/handling/eldritchBlastHandlerFactory.js';

const preCheck: EldritchBlastPreCheck = async ({ ditem, feature }) => {
  if (!ditem) return false;
  if (ditem.newHP === ditem.oldHP) return false;
  return !!feature.system.uses!.value;
};

const handle: EldritchBlastHandler = async ({ workflow, feature }) => {
  const target = workflow.hitTargets.first()! as Token;
  await runActivity(feature, 'apply', [target]);
};

addEldritchBlastHandler({
  pass: 'damageRollComplete',
  cprIdentifier: 'ac55eLanceOfLethargy',
  exclusive: false,
  preCheck,
  handle,
});
