import { Workflow } from '@midi-qol/types/module/Workflow';
import {
  actorUtils,
  dialogUtils,
  rollUtils,
  socketUtils,
  workflowUtils,
} from 'chrisPremades';
import { AlternateClasses55e } from '../../../../types/alternate-classes-55e';

async function pre(
  actor: Actor,
  sourceActor: Actor,
): Promise<boolean> {
  if (actorUtils.hasUsedReaction(actor)) return false;
  return await dialogUtils.confirm(
    actor.name,
    `${sourceActor.name} is performing a D20 Test, \
    use Storm Rune?`,
    { userId: socketUtils.firstOwner(actor, true) },
  );
}

async function determineBonus(
  actor: Actor,
  altClassesModule: AlternateClasses55e,
): Promise<string> {
  const exploitDie = altClassesModule.api
    .getAlternateMartialExploitDieWithActor(actor);
  if (!exploitDie) return '';
  const options: [string, string][] = [
    ['Add', 'add'],
    ['Subtract', 'subtract'],
  ];
  const selection = await dialogUtils.buttonDialog(
    'Storm Rune: Prophecy',
    'Would you like to add or subtract?',
    options,
    { userId: socketUtils.firstOwner(actor, true) },
  );
  return selection === 'add'
    ? `1d${exploitDie.faces}`
    : `-1d${exploitDie.faces}`;
}

async function during(
  actor: Actor,
  roll: Roll,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const formula = await determineBonus(actor, altClassesModule);
  return await rollUtils.addToRoll(roll, formula);
}

async function post(actor: Actor): Promise<void> {
  await actorUtils.setReactionUsed(actor);
}

async function workflow({ trigger: { actor, sourceActor, roll } }) {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const res1 = await pre(actor, sourceActor);
  if (!res1) return;
  const res2 = await during(actor, roll, altClassesModule);
  if (!res2) return;
  await post(actor);
  return res2;
}

async function attackDuring(
  actor: Actor,
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
): Promise<boolean> {
  const formula = await determineBonus(actor, altClassesModule);
  if (!formula) return false;
  await workflowUtils.bonusAttack(workflow, formula);
  return true;
}

async function attackWorkflow({ trigger: { token }, workflow }) {
  const altClassesModule = game.modules
    ?.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const res1 = await pre(token.actor, workflow.actor);
  if (!res1) return;
  const res2 = await attackDuring(token.actor, workflow, altClassesModule);
  if (!res2) return;
  await post(token.actor);
}

export const ac55eStormRuneProphecy = {
  name: 'Storm Rune: Prophecy',
  version: '1.3.141',
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
