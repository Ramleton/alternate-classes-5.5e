import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import { getKiRemaining } from './utils.js';

const CPRIdentifier = 'ac55eDeflectMissileMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({ workflow, technique }) => {
  if (!workflow.hitTargets.size) return false;
  const {
    utils: { actorUtils, constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  const monkLevel = technique.actor!.classes['alternate-monk'].system.levels;
  const isValidAttack =
    monkLevel >= 11
      ? constants.rangedAttacks.some((type) => type === actionType)
      : actionType === 'rwak';
  if (!isValidAttack) return false;
  if (actorUtils.hasUsedReaction(technique.actor!)) return false;
  if (!getKiRemaining(technique.actor!)) return false;
  return true;
};

const handle: MysticTechniqueHandler = async ({
  trigger: { token },
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
  const userId = socketUtils.firstOwner(technique.actor!, true);
  const selection = await dialogUtils.confirm(
    technique.name,
    'You caught the ranged attack, spend 1 Ki to deflect it?',
    {
      userId,
    },
  );
  if (!selection) return;
  const nearbyTokens = tokenUtils.findNearby(token, 60, 'any');
  const selectedTarget = await dialogUtils.selectTargetDialog(
    technique.name,
    'Select a target to deflect the attack at',
    nearbyTokens,
    {
      userId,
    },
  );
  if (!selectedTarget || !selectedTarget[0]) return;
  await runActivity(technique, 'attack', [selectedTarget[0]]);
};

addMysticTechniqueHandler({
  pass: 'targetDamageRollComplete',
  cprIdentifier: CPRIdentifier,
  exclusive: true,
  preCheck,
  handle,
});

const macro: CPRMacro = {
  identifier: CPRIdentifier,
  name: 'Mystic Techniques: Deflect Missile',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
