import { Workflow } from '@midi-qol/types/module/Workflow';
import {
  dialogUtils,
  effectUtils,
  socketUtils,
  workflowUtils,
} from 'chrisPremades';
import {
  AlternateClasses55eAPI,
} from '../../../../types/alternate-classes-55e';

async function pre(
  item,
  token,
  sourceToken,
  targetToken,
  workflow: Workflow,
  altClassesModule: AlternateClasses55eAPI,
): Promise<boolean> {
  // Don't prompt if the attacker is the user
  if (token.id === sourceToken.id)
    return false;
  // Don't prompt if the user has no remaining Exploit Dice
  if (!altClassesModule.api.getAltMartialExploitsRemaining(item))
    return false;
  // Don't prompt if the target was not hit
  if (!workflow.hitTargets.size)
    return false;
  // Don't prompt if the target is not the guarded creature
  const interposeEffect = effectUtils.getEffectByIdentifier(
    targetToken.actor,
    'ac55eNobleGuardianInterposeEffect',
  );
  if (!interposeEffect) return false;
  const selection = await dialogUtils.confirm(
    'Noble Guardian: Resistance',
    'The guarded creature was hit, expend an exploit die?',
    { userId: socketUtils.firstOwner(token.actor, true) },
  );
  return selection;
}

async function during(
  item,
  targetToken,
  workflow: Workflow,
  altClassesModule: AlternateClasses55eAPI,
) {
  const exploitDie = altClassesModule.api.getAlternateMartialExploitDie(item);
  if (!exploitDie) return false;
  const effectData = {
    name: 'Noble Guardian: Resistance',
    icon: item.img,
    duration: {
      seconds: 1,
    },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eNobleGuardianResistanceEffect',
        },
        nobleGuardian: {
          itemId: workflow.item.id,
        },
      },
    },
    changes: [
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: `ALL`,
        priority: 20,
      },
    ],
  };
  const effect = await effectUtils.createEffect(targetToken.actor, effectData);
  await workflowUtils.addEntityRemoval(workflow, [effect]);
  return true;
}

async function workflow({
  trigger: { entity: item, token, sourceToken, targetToken },
  workflow,
}) {
  const altClassesModule = game
    .modules
    .get('alternate-classes-55e') as AlternateClasses55eAPI | undefined;
  if (!altClassesModule) return;
  const res1 = await pre(
    item,
    token,
    sourceToken,
    targetToken,
    workflow,
    altClassesModule,
  );
  if (!res1) return;
  await during(item, targetToken, workflow, altClassesModule);
}

export const ac55eNobleGuardianResistance = {
  name: 'Noble Guardian: Resistance',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneAttackRollComplete',
        macro: workflow,
        priority: 250,
      },
    ],
  },
};
