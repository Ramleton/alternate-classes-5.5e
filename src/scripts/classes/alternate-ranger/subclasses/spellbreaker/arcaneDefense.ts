import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const bonus: MacroFunction = async ({ trigger: { actor, config, roll } }) => {
  const sourceActor = config.midiOptions!.workflow.actor as Actor5e;
  if (!config.midiOptions!.isMagicSave) return;
  if (!isQuarry(actor!, sourceActor)) return;
  const {
    utils: { effectUtils, rollUtils, workflowUtils },
  } = chrisPremades;
  const workflow = config.midiOptions!.workflow;
  if (workflow.activity.damage.parts?.length) {
    const effectData: EffectData = {
      name: 'Arcane Defense: Evasion',
      icon: null,
      duration: { seconds: 1 },
      origin: '',
      flags: {
        dae: {
          stackable: 'noneName',
        },
      },
      changes: [
        {
          key: 'flags.midi-qol.superSaver.all',
          mode: 0,
          value: '1',
          priority: 20,
        },
      ],
      statuses: [],
    };
    const effect = await effectUtils.createEffect(actor!, effectData);
    await workflowUtils.addEntityRemoval(workflow, [effect]);
  }
  const saveBonus = Math.max(1, actor?.system.abilities.wis.mod ?? 0);
  return await rollUtils.addToRoll(roll, '' + saveBonus);
};

const macro: CPRMacro = {
  identifier: 'ac55eArcaneDefense',
  name: 'Spellbreaker: Arcane Defense',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  save: [
    {
      pass: 'bonus',
      macro: bonus,
      priority: 100,
    },
  ],
};

export default macro;
