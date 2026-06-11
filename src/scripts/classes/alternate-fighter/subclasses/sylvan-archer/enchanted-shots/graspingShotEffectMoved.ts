import CPRMacro, { MacroFunction, MidiActiveEffect } from 'chris-premades/macro';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';

async function pre(effect: MidiActiveEffect): Promise<boolean> {
  return !effect.flags['alternate-classes-55e']?.graspingShot?.moved;
}

async function post(effect: MidiActiveEffect, token: Token): Promise<void> {
  const exploitDie = effect
    .flags['alternate-classes-55e']
    ?.graspingShot
    ?.exploitDie as ScaleValueTypeDice | undefined;
  if (!exploitDie) return;
  const { utils: {
    rollUtils,
    genericUtils,
    workflowUtils,
  } } = chrisPremades;
  const originActor = effect
    .flags['alternate-classes-55e']
    ?.graspingShot
    ?.originActor;
  if (!originActor) return;
  const rolled = await rollUtils.rollDice(
    `2d${exploitDie.faces}`,
    { chatMessage: true },
  );
  await workflowUtils.applyDamage([token], rolled.roll.total, 'piercing');
  await genericUtils.setFlag(
    effect,
    'alternate-classes-55e',
    'graspingShot.moved',
    true,
  );
  return;
}

const workflow: MacroFunction = async ({
  trigger: { entity: effect, token },
}) => {
  const res1 = await pre(effect);
  if (!res1) return;
  await post(effect, token);
};

const macro: CPRMacro = {
  identifier: 'ac55eGraspingShotEffectMoved',
  name: 'Grasping Shot: Moved',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  movement: [{
    pass: 'moved',
    macro: workflow,
    priority: 100,
  }],
};

export default macro;
