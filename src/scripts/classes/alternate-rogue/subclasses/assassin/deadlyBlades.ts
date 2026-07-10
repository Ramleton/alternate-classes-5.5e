import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';

export const handleDeadlyBlades = async (
  feat: Item<'feat'>,
  workflow: Workflow,
) => {
  await runActivity(
    feat,
    'save',
    Array.from(workflow.hitTargets as Set<Token>),
  );
};

const criticalRerollOnes: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!workflow.isCritical || !workflow.damageRolls?.length) return;
  const updatedRolls = [...workflow.damageRolls];
  const {
    utils: { rollUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  for (const roll of updatedRolls) {
    for (const die of roll.dice as (foundry.dice.terms.DiceTerm & {
      _total: number;
    })[]) {
      for (const dieResult of die.results) {
        if (dieResult.result === 1) {
          const newRoll = await rollUtils.rollDice(`1d${die.faces}`, {
            entity: feat.actor!,
            chatMessage: true,
            flavor: 'Deadly Blades: Reroll 1s',
          });
          dieResult.result = newRoll.roll.total;
        }
      }
      die._total = die.results
        .filter((r) => r.active)
        .reduce((acc: number, r) => acc + r.result, 0);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (roll as any)._total = (roll as any)._evaluateTotal();
  }
  await workflow.setDamageRolls(updatedRolls);
};

const macro: CPRMacro = {
  identifier: 'ac55eDeadlyBlades',
  name: 'Assassin: Deadly Blades',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: criticalRerollOnes,
        priority: 500,
      },
    ],
  },
};

export default macro;
