import { getWorkflowProperty } from 'automation/workflowUtils.js';
import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';
import {
  getAltMartialExploitDie,
  getAltMartialExploitsRemaining,
  spendAlternateMartialExploitUses,
} from 'exploits/utils.js';

const autoCritical: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!getWorkflowProperty(workflow, feat.actor!, 'sneakAttack')) return;
  if (!workflow.hitTargets.size) return;
  const {
    utils: { constants, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  const target = workflow.targets.first() as Token;
  const isTargetIncapacitated = target.actor!.statuses.has('incapacitated');
  const isTargetSurprised = target.actor!.statuses.has('surprised');
  if (!isTargetIncapacitated && !isTargetSurprised) return;
  workflow.isCritical = true;
  // TODO: Update Chat Card with Critical Hit
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const chatMessage = (game.messages as any).get(
  //   workflow.itemCardId,
  // ) as ChatMessage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedAttackRoll = workflow.attackRoll as any;
  const attributions = updatedAttackRoll.options.attributions ?? [];
  attributions.push({
    type: 'CRIT',
    source: feat.name,
    displayName: 'Critical Hit',
  });
  // updatedAttackRoll.options.attributions = attributions;
  // const newAttackRollHTML =
  //   await MidiQOL.midiRenderAttackRoll(updatedAttackRoll);
  // // Update Chat Card
  // const container = document.createElement('div');
  // container.innerHTML = workflow.chatCard.content;
  // const oldAttackRollDiv = container.querySelector('.midi-qol-attack-roll');
  // console.log(container, oldAttackRollDiv, newAttackRollHTML);
  // if (oldAttackRollDiv) {
  //   oldAttackRollDiv.outerHTML = newAttackRollHTML;
  //   await chatMessage.update({ content: container.innerHTML });
  // }
  await workflow.setAttackRoll(updatedAttackRoll);
};

const prompt: MacroFunction = async ({ trigger: { entity, token } }) => {
  const feat = entity as Item<'feat'>;
  if (!getAltMartialExploitsRemaining(feat)) return;
  const {
    utils: { genericUtils, dialogUtils, socketUtils, rollUtils },
  } = chrisPremades;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    'Combat has begun, do you want to expend an Exploit Die and add it to your Initiative Roll?',
    { userId },
  );
  if (!selection) return;
  await spendAlternateMartialExploitUses(1, feat);
  const exploitDie = getAltMartialExploitDie(feat);
  if (!exploitDie) return;
  const formula = `1d${exploitDie.faces}`;
  const roll = await rollUtils.rollDice(formula, {
    entity: feat.actor!,
    chatMessage: true,
  });
  const combatant = game.combat!.getCombatantsByToken(token.id!)[0];
  const newInitiative = combatant.initiative + roll.roll.total;
  await genericUtils.update(combatant, { initiative: newInitiative }, {}, true);
};

const macro: CPRMacro = {
  identifier: 'ac55eAssassinate',
  name: 'Assassin: Assassinate',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: autoCritical,
        priority: 100,
      },
    ],
  },
  combat: [
    {
      pass: 'combatStart',
      macro: prompt,
      priority: 100,
    },
  ],
};

export default macro;
