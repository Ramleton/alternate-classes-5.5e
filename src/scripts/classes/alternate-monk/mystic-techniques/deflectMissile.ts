import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';
import {
  addMysticTechniqueHandler,
  MysticTechniqueHandler,
  MysticTechniquePreCheck,
} from '../class-features/handling/mysticTechniqueHandlerFactory.js';
import { handleMysticalDefense } from '../subclasses/Astral Warrior/mysticalDefense.js';
import { getKiRemaining, spendKi } from './utils.js';

const CPRIdentifier = 'ac55eDeflectMissileMysticTechnique';

const preCheck: MysticTechniquePreCheck = async ({ workflow, technique }) => {
  if (!workflow.hitTargets.size) return false;
  const {
    utils: { actorUtils, constants, effectUtils, itemUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  const monkLevel = technique.actor!.classes['alternate-monk'].system.levels;
  const astralArmorEffect = effectUtils.getEffectByIdentifier(
    technique.actor!,
    'ac55eAstralArmorEffect',
  );
  const astralWarrior = itemUtils.getItemByIdentifier(
    technique.actor!,
    'ac55eAstralWarrior',
  );
  const minLevel = astralWarrior ? 10 : 11;
  const isValidAttack =
    monkLevel >= minLevel
      ? constants.rangedAttacks.some((type) => type === actionType)
      : actionType === 'rwak';
  if (!isValidAttack) return false;
  if (actorUtils.hasUsedReaction(technique.actor!)) return false;
  if (!getKiRemaining(technique.actor!) && !astralArmorEffect) return false;
  return true;
};

const handleTechnique: MysticTechniqueHandler = async ({
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
      effectUtils,
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
  const astralArmorEffect = effectUtils.getEffectByIdentifier(
    technique.actor!,
    'ac55eAstralArmorEffect',
  );
  if (!astralArmorEffect) await spendKi(technique.actor!, 1);
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

const handle: MysticTechniqueHandler = async (data) => {
  await handleTechnique(data);
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const astralArmorEffect = effectUtils.getEffectByIdentifier(
    data.technique.actor!,
    'ac55eAstralArmorEffect',
  );
  if (!astralArmorEffect) return;
  await handleMysticalDefense(data);
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
