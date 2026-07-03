import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';
import {
  getAlternateMartialExploitDie,
  getAltMartialExploitsRemaining,
  spendAlternateMartialExploitUses,
} from 'exploits/utils.js';

const autoCritical: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!feat.actor.flags['alternate-classes-55e']?.macros?.['sneak-attack'])
    return;
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
  await ChatMessage.create({
    content: `${feat.name}: Critical Hit`,
    speaker: ChatMessage.getSpeaker({ token: token }),
  });
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
  const exploitDie = getAlternateMartialExploitDie(feat);
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
