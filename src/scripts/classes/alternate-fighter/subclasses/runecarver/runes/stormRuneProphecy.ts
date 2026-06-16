import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { D20Roll, MacroFunction, MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDieWithActor } from 'exploits/utils.js';

const pre = async (actor: Actor5e, sourceActor: Actor5e) => {
  const { utils: { actorUtils, dialogUtils, socketUtils } } = chrisPremades;
  if (actorUtils.hasUsedReaction(actor))
    return false;
  return await dialogUtils.confirm(
    actor.name,
    `${sourceActor.name} is performing a D20 Test, use Storm Rune?`,
    { userId: socketUtils.firstOwner(actor, true) },
  );
};
const determineBonus = async (actor: Actor5e) => {
  const exploitDie = getAlternateMartialExploitDieWithActor(actor);
  if (!exploitDie)
    return '';
  const options: [string, string][] = [
    ['Add', 'add'],
    ['Subtract', 'subtract'],
  ];
  const { utils: { dialogUtils, socketUtils } } = chrisPremades;
  const selection = await dialogUtils.buttonDialog(
    'Storm Rune: Prophecy',
    'Would you like to add or subtract?',
    options,
    { userId: socketUtils.firstOwner(actor, true) },
  );
  return selection === 'add'
    ? `1d${exploitDie.faces}`
    : `-1d${exploitDie.faces}`;
};
const during = async (actor: Actor5e, roll: D20Roll): Promise<D20Roll> => {
  const formula = await determineBonus(actor);
  const { utils: { rollUtils } } = chrisPremades;
  return await rollUtils.addToRoll(roll, formula);
};
const post = async (actor: Actor5e) => {
  const { utils: { actorUtils } } = chrisPremades;
  await actorUtils.setReactionUsed(actor);
};
const workflow: MacroFunction = async (
  { trigger: { actor, sourceActor, roll } },
) => {
  if (!actor || !sourceActor || !roll)
    return;
  const res1 = await pre(actor, sourceActor);
  if (!res1)
    return;
  const res2 = await during(actor, roll);
  if (!res2)
    return;
  await post(actor);
  return res2;
};
const attackDuring = async (
  actor: Actor5e,
  workflow: Workflow,
) => {
  const formula = await determineBonus(actor);
  if (!formula)
    return false;
  const { utils: { workflowUtils } } = chrisPremades;
  await workflowUtils.bonusAttack(workflow, formula);
  return true;
};
const attackWorkflow: MidiMacroFunction = async (
  { trigger: { token }, workflow },
) => {
  if (!token.actor!)
    return;
  const res1 = await pre(token.actor, workflow.actor);
  if (!res1)
    return;
  const res2 = await attackDuring(token.actor, workflow);
  if (!res2)
    return;
  await post(token.actor);
};
const macro: CPRMacro = {
  identifier: 'ac55eStormRune',
  name: 'Runecarver Runes: Storm Rune',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  skill: [
    {
      pass: 'sceneBonus',
      macro: workflow,
      priority: 50,
      distance: 60,
    },
  ],
  save: [
    {
      pass: 'sceneBonus',
      macro: workflow,
      priority: 50,
      distance: 60,
    },
  ],
  midi: {
    actor: [
      {
        pass: 'scenePostAttackRoll',
        macro: attackWorkflow,
        priority: 50,
        distance: 60,
      },
    ],
  },
};

export default macro;
