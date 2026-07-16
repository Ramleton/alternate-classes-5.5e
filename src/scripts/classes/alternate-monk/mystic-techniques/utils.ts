import { Workflow } from '@midi-qol/types/module/Workflow.js';

export const getKiRemaining = (actor: Actor5e): number => {
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const mysticTechniques = itemUtils.getItemByIdentifier(
    actor,
    'ac55eMysticTechniques',
  )! as Item<'feat'>;
  return mysticTechniques.system.uses!.value;
};

export const isMartialArtsAttack = (weapon: Item<'weapon'>): boolean => {
  const {
    utils: { itemUtils },
  } = chrisPremades;
  return !!itemUtils.getEffectByIdentifier(
    weapon,
    'ac55eMartialArtsEnchantment',
  );
};

export const isMeleeMartialArtsAttack = (
  weapon: Item<'weapon'>,
  workflow: Workflow,
): boolean => {
  const {
    utils: { constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.meleeAttacks.some((attackType) => attackType === actionType))
    return false;
  return isMartialArtsAttack(weapon);
};
