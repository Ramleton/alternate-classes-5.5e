import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isQuarry } from '../utils/quarryUtils.js';

const prompt: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!feat.system.uses?.value) return;
  if (!workflow.hitTargets.size) return;
  const {
    utils: { dialogUtils, socketUtils },
  } = chrisPremades;
  const target = workflow.hitTargets.first() as Token;
  if (!isQuarry(feat, target)) return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  const options: [string, string][] = [
    ['Blinded', 'blinded'],
    ['Deafened', 'deafened'],
    ['Silenced', 'silenced'],
    ['Restrained', 'restrained'],
  ];
  const selectedOption = await dialogUtils.buttonDialog(
    feat.name,
    'Select a condition',
    options,
  );
  if (!selectedOption) return;
  await runActivity(feat, selectedOption, [target]);
};

const macro: CPRMacro = {
  identifier: 'ac55eSlayerIII',
  name: 'Slayer III',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
};

export default macro;
