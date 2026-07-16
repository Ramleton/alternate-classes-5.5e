import CPRMacro from 'chris-premades/macro.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import { getKiRemaining } from './utils.js';

const CPRIdentifier = 'ac55eDeflectStrikeMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({ workflow, technique }) => {
  if (!workflow.hitTargets.size) return false;
  const {
    utils: { actorUtils, constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  const monkLevel = technique.actor!.classes['alternate-monk'].system.levels;
  const isValidAttack =
    monkLevel >= 11
      ? constants.meleeAttacks.some((type) => type === actionType)
      : actionType === 'mwak';
  if (!isValidAttack) return false;
  if (actorUtils.hasUsedReaction(technique.actor!)) return false;
  if (!getKiRemaining(technique.actor!)) return false;
  return true;
};

const handle: MysticTechniqueHandler = async ({
  trigger: { token },
  workflow,
  technique,
  ditem,
}) => {
  const monkLevel = technique.actor!.classes['alternate-monk'].system.levels;
  const dexMod = technique.actor!.system.abilities.dex.mod;
  const martialArtsDie = (
    technique.actor!.system.scale['alternate-monk'][
      'martial-arts'
    ]! as ScaleValueTypeDice
  ).formula;
  const {
    utils: {
      activityUtils,
      dialogUtils,
      genericUtils,
      rollUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const res = await rollUtils.rollDice(martialArtsDie, { chatMessage: true });
  await genericUtils.sleep(2000);
  const damageReduction = monkLevel + res.roll.total + dexMod;
  workflowUtils.modifyDamageAppliedFlat(ditem!, -damageReduction);
  if (ditem!.totalDamage) return;
  const distance = tokenUtils.getDistance(token, workflow.token!);
  const validWeapons = technique.actor!.items.filter(
    (i) =>
      i.flags['chris-premades']?.info?.identifier === 'unarmedStrike' &&
      (i as Item<'weapon'>).system.range.reach! >= distance,
  ) as Item<'weapon'>[];
  if (!validWeapons.length)
    return genericUtils.notify("You don't have an unarmed strike.", 'warn');
  let selectedWeapon: Item<'weapon'> | undefined = undefined;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      `${technique.name}`,
      'Select a weapon to use',
      validWeapons,
      {
        userId: socketUtils.firstOwner(technique.actor!, true),
      },
    );
    if (!selectedWeapon) return;
  }
  const activity = activityUtils.getActivityByIdentifier(
    selectedWeapon,
    'punch',
    {
      strict: true,
    },
  );
  if (!activity) return;
  const activityData = genericUtils.duplicate(activity.toObject());
  await workflowUtils.syntheticActivityDataRoll(
    activityData,
    selectedWeapon,
    technique.actor!,
    [workflow.token!],
    { consumeResources: true },
  );
};

addMysticTechniqueHandler({
  pass: 'targetDamageRollComplete',
  cprIdentifier: CPRIdentifier,
  preCheck,
  handle,
});

const macro: CPRMacro = {
  identifier: CPRIdentifier,
  name: 'Mystic Techniques: Deflect Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
