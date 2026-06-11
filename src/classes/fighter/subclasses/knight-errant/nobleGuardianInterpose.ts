import { Workflow } from '@midi-qol/types/module/Workflow';
import {
  actorUtils,
  dialogUtils,
  effectUtils,
  itemUtils,
  socketUtils,
  tokenUtils,
  workflowUtils,
} from 'chrisPremades';
import {
  AlternateClasses55e,
} from '../../../../types/alternate-classes-55e';

async function pre(
  token,
  sourceToken,
  targetToken,
  workflow: Workflow,
): Promise<boolean> {
  // Don't prompt if the attacker is the user
  if (token.id === sourceToken.id)
    return false;
  // Don't prompt if the target is more than 5 feet away
  if (tokenUtils.getDistance(token, targetToken) > 5)
    return false;
  // Don't prompt if the target's AC is higher than the attack
  if (targetToken.actor.system.attributes.ac.value > workflow.attackTotal)
    return false;
  // Don't prompt if the user has already used a reaction
  if (actorUtils.hasUsedReaction(token.actor)) {
    const legendaryKnightErrant = itemUtils.getItemByIdentifier(
      token.actor,
      'ac55eLegendaryKnightErrant',
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(legendaryKnightErrant as any)?.system?.uses?.value) return false;
  }
  const validEquipment = token.actor.items
    .filter(i => i.system.equipped)
    .filter(i =>
      ['simpleM', 'martialM', 'shield'].includes(i.system.type.value));
  if (!validEquipment.length) return false;
  const selection = await dialogUtils.confirm(
    'Noble Guardian: Interpose',
    'A creature within 5 feet is hit by an attack. Do you want to interpose?',
    { userId: socketUtils.firstOwner(token.actor, true) },
  );
  return selection;
}

async function during(
  item,
  targetToken,
  workflow: Workflow,
  altClassesModule: AlternateClasses55e,
) {
  const exploitDie = altClassesModule.api.getAlternateMartialExploitDie(item);
  if (!exploitDie) return false;
  const effectData = {
    name: 'Noble Guardian: Interpose',
    icon: item.img,
    duration: {
      seconds: 1,
    },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eNobleGuardianInterposeEffect',
        },
        nobleGuardian: {
          itemId: workflow.item.id,
        },
      },
    },
    changes: [
      {
        key: 'flags.automated-conditions-5e.modifyAC',
        mode: 0,
        value: `bonus=1d${exploitDie.faces};`,
        priority: 20,
      },
    ],
  };
  const effect = await effectUtils.createEffect(targetToken.actor, effectData);
  await workflowUtils.addEntityRemoval(workflow, [effect]);
  return true;
}

async function post(token): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legendaryKnightErrant: any = itemUtils.getItemByIdentifier(
    token.actor,
    'ac55eLegendaryKnightErrant',
  );
  if (!legendaryKnightErrant) return;
  await legendaryKnightErrant.update({
    'system.uses.spent': legendaryKnightErrant.system.uses.spent + 1,
  });
}

async function workflow({
  trigger: { entity: item, token, sourceToken },
  workflow,
}) {
  const reactionSpent = actorUtils.hasUsedReaction(token.actor);
  const altClassesModule = (game
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .modules as any)
    .get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule) return;
  const targetToken = workflow.targets.first();
  if (!targetToken) return false;
  const res1 = await pre(token, sourceToken, targetToken, workflow);
  if (!res1) return;
  const res2 = await during(item, workflow, targetToken, altClassesModule);
  if (!res2 && !reactionSpent) return;
  await post(token);
}

export const ac55eNobleGuardianInterpose = {
  name: 'Noble Guardian: Interpose',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'scenePostEvaluation',
        macro: workflow,
        priority: 50,
      },
    ],
  },
};
