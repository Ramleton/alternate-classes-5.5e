import { Workflow } from '@midi-qol/types/module/Workflow';

export const isMartialArtsAttack = async (
  { workflow }:
  { workflow: Workflow },
): Promise<boolean> => {
  const { utils: { itemUtils, workflowUtils } } = chrisPremades;
  if (!workflowUtils.isAttackType(workflow, 'attack')) return false;
  const signatureWeapon = itemUtils
    .getEffectByIdentifier(
      workflow.item,
      'ac55eSignatureWeapon',
    );
  if (signatureWeapon) return true;
  const martialArts = itemUtils.getEffectByIdentifier(
    workflow.item,
    'ac55eMartialArtsEnchantment',
  );
  if (!martialArts) return false;
  return true;
};

export const isMeleeMartialArtsAttack = async (
  { workflow }: { workflow: Workflow },
): Promise<boolean> => {
  const { utils: { workflowUtils } } = chrisPremades;
  const radiantBolt = workflow
    .item
    ?.flags
    ?.['chris-premades']
    ?.info
    ?.identifier === 'ac55eRadiantBolt';
  if (radiantBolt) return true;
  if (workflowUtils.getActionType(workflow) !== 'mwak') return false;
  return (isMartialArtsAttack({ workflow }));
};
