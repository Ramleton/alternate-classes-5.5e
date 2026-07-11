import { Workflow } from '@midi-qol/types/module/Workflow.js';

export const getMeleeWeapons = (actor: Actor5e): Item<'weapon'>[] => {
  const {
    utils: { constants },
  } = chrisPremades;
  return actor.items
    .filter((i) => i.type === 'weapon')
    .map((i) => i as Item<'weapon'>)
    .filter((i) => i.system.equipped)
    .filter((i) =>
      constants.meleeWeaponTypes.some((type) => type === i.system.type?.value),
    );
};

export const getMeleeWeaponsInRange = (
  source: Token,
  target: Token,
): Item<'weapon'>[] => {
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  return getMeleeWeapons(source.actor!).filter(
    (i) => tokenUtils.getDistance(source, target) <= i.system.range!.reach!,
  );
};

export const getTokensInMeleeWeaponReach = ({ token, workflow }): Token[] => {
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  const reach = (workflow.item as Item<'weapon'>).system.range.reach!;
  return tokenUtils.findNearby(token, reach, 'any', {
    includeIncapacitated: true,
    includeToken: false,
  });
};

export const getRangedWeapons = (actor: Actor5e): Item<'weapon'>[] => {
  const {
    utils: { constants },
  } = chrisPremades;
  return actor.items
    .filter((i) => i.type === 'weapon')
    .map((i) => i as Item<'weapon'>)
    .filter((i) => i.system.equipped)
    .filter((i) =>
      constants.rangedWeaponTypes.some((type) => type === i.system.type?.value),
    );
};

export const getRangedWeaponsInLongRange = (
  source: Token,
  target: Token,
): Item<'weapon'>[] => {
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  return getRangedWeapons(source.actor!).filter(
    (i) => tokenUtils.getDistance(source, target) <= i.system.range!.long!,
  );
};

export const getRangedWeaponsInRange = (
  source: Token,
  target: Token,
): Item<'weapon'>[] => {
  const {
    utils: { tokenUtils },
  } = chrisPremades;
  return getRangedWeapons(source.actor!).filter(
    (i) => tokenUtils.getDistance(source, target) <= i.system.range!.value!,
  );
};

export const getValidWeapons = (
  source: Token,
  target: Token,
  longRange = false,
): Item<'weapon'>[] => {
  return [
    ...getMeleeWeaponsInRange(source, target),
    ...(longRange
      ? getRangedWeaponsInLongRange(source, target)
      : getRangedWeaponsInRange(source, target)),
  ];
};

export const promptSelectWeapon = async (
  feat: Item<'feat'>,
  weapons: Item<'weapon'>[],
): Promise<Item<'weapon'> | undefined> => {
  const {
    utils: { dialogUtils },
  } = chrisPremades;
  if (weapons.length === 1) return weapons[0];
  const selectedWeapon = (await dialogUtils.selectDocumentDialog(
    `${feat.name}: Select Weapon`,
    'Select a weapon to use',
    weapons,
  )) as Item<'weapon'> | undefined;
  return selectedWeapon;
};

export interface ExploitPrerequisiteCheckArgs {
  feat: Item<'feat'>;
  token: Token;
  workflow: Workflow;
}

export type ExploitPrerequisiteCheck = ({
  feat,
  token,
  workflow,
}: ExploitPrerequisiteCheckArgs) => boolean;

export const hitCheck: ExploitPrerequisiteCheck = ({ workflow }): boolean => {
  return !!workflow.hitTargets.size;
};

export const attackHitCheck: ExploitPrerequisiteCheck = (data): boolean => {
  if (!hitCheck(data)) return false;
  const {
    utils: { constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(data.workflow);
  return constants.attacks.some((attack) => attack === actionType);
};

export const isWeaponAttack: ExploitPrerequisiteCheck = ({
  workflow,
}): boolean => {
  const {
    utils: { constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  return constants.weaponAttacks.some((type) => type === actionType);
};

export const isMeleeWeaponAttack: ExploitPrerequisiteCheck = ({
  workflow,
}): boolean => {
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  return actionType === 'mwak';
};

export const weaponAttackHitCheck: ExploitPrerequisiteCheck = (
  data,
): boolean => {
  return hitCheck(data) && isWeaponAttack(data);
};

export const meleeWeaponAttackHitCheck: ExploitPrerequisiteCheck = (
  data,
): boolean => {
  return hitCheck(data) && isMeleeWeaponAttack(data);
};

export const meleeWeaponAttackCritCheck: ExploitPrerequisiteCheck = (
  data,
): boolean => data.workflow.isCritical && isMeleeWeaponAttack(data);

export const meleeWeaponAttackMissCheck: ExploitPrerequisiteCheck = (
  data,
): boolean => {
  return !hitCheck(data) && isMeleeWeaponAttack(data);
};

export const meleeWeaponAttackRedirectCheck: ExploitPrerequisiteCheck = (
  data,
): boolean => {
  if (!meleeWeaponAttackMissCheck(data)) return false;
  return getTokensInMeleeWeaponReach(data).length < 2;
};
