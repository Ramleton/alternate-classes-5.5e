import { runActivity } from 'automation/utils.js';
import { getMeleeWeaponsInRange } from 'automation/weaponUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const applyConcentrationDisadvantage: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const {
    utils: { constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  const target = workflow.hitTargets.first() as Token;
  const targetActor = target.actor!;
  const feat = entity as Item<'feat'>;
  if (!targetActor.statuses.has('concentrating')) return;
  if (!isQuarry(feat.actor!, targetActor)) return;
  await runActivity(feat, 'use', [target]);
};

const reactionAttack: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (workflow.token!.id === token.id) return;
  if (workflow.item.type !== 'spell') return;
  const {
    utils: { actorUtils, dialogUtils, socketUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  if (!tokenUtils.canSee(token!, workflow.token!)) return;
  const weaponsInReach = getMeleeWeaponsInRange(token, workflow.token!);
  if (!weaponsInReach.length) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    'A creature within your reach is casting a spell, use your reaction to attack it?',
    { userId },
  );
  if (!selection) return;
  let selectedWeapon: Item<'weapon'> | undefined;
  if (weaponsInReach.length === 1) {
    selectedWeapon = weaponsInReach[0];
  } else {
    selectedWeapon = (await dialogUtils.selectDocumentDialog(
      `${feat.name}: Select Weapon`,
      'Select a weapon to use',
      weaponsInReach,
      { userId },
    )) as Item<'weapon'> | undefined;
    if (!selectedWeapon) return;
  }
  await workflowUtils.syntheticItemRoll(selectedWeapon, [workflow.token!], {
    userId,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eMageBreaker',
  name: 'Spellbreaker: Mage Breaker',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: applyConcentrationDisadvantage,
        priority: 100,
      },
      {
        pass: 'scenePreambleComplete',
        macro: reactionAttack,
        priority: 100,
      },
    ],
  },
};

export default macro;
