import { promptSpellSlotChoice } from 'automation/spellUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getQuarryDie, isQuarry } from '../../utils/quarryUtils.js';

const prompt: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: { constants, dialogUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  const target = workflow.hitTargets.first() as Token;
  if (!isQuarry(feat.actor!, target.actor!)) return;
  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    `Spend a Spell Slot to deal extra Force damage to ${target.name}?`,
    { userId },
  );
  if (!selection) return;
  const spellLevel = await promptSpellSlotChoice(feat.actor!);
  if (!spellLevel) return;
  const quarryDie = getQuarryDie(feat.actor!);
  if (!quarryDie) return;
  await workflowUtils.bonusDamage(workflow, `${spellLevel}${quarryDie}`);
};

const counterSpellDCBoost: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  if (workflow.item.name !== 'Counterspell') return;
  if (workflow.activity.type !== 'save') return;
  const feat = entity as Item<'feat'>;
  const quarryDie = getQuarryDie(feat.actor!);
  if (!quarryDie) return;
  const {
    utils: { genericUtils, rollUtils },
  } = chrisPremades;
  const roll = (await rollUtils.rollDice(`1${quarryDie}`, {
    chatMessage: true,
  })) as { roll: Roll; message: ChatMessage };
  await genericUtils.sleep(1500);
  workflow.activity.save.dc.value += roll.roll.total ?? 0;
};

const macro: CPRMacro = {
  identifier: 'ac55eSpellbane',
  name: 'Spellbreaker: Spellbane',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'preambleComplete',
        macro: counterSpellDCBoost,
        priority: 100,
      },
      {
        pass: 'damageRollComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
};

export default macro;
