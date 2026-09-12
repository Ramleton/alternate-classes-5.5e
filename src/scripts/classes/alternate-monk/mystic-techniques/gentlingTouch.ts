import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';
import { getKiRemaining, spendKi } from './utils.js';

const GENTLING_TOUCH_DICE_MULTIPLIER = 5;

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const {
    utils: { dialogUtils, genericUtils, rollUtils },
  } = chrisPremades;
  const remainingKi = getKiRemaining(workflow.actor);
  if (!remainingKi) return genericUtils.notify('No ki remaining', 'warn');
  const feat = entity as Item<'feat'>;
  const wisMod = feat.actor!.system.abilities.wis.mod ?? 0;
  const maxUses = Math.min(remainingKi, 1 + wisMod);
  let selectedUses = 0;
  if (maxUses === 1) {
    selectedUses = 1;
  } else {
    const selectionOptions: [string, string][] = [];
    for (let i = 1; i <= maxUses; i++) {
      selectionOptions.push([
        `${i} Martial Arts ${i === 1 ? 'Die' : 'Dice'}`,
        '' + i,
      ]);
    }
    selectedUses = Number.parseInt(
      await dialogUtils.buttonDialog(
        `${feat.name}: Martial Arts Dice`,
        'How many Martial Arts Dice would you like to spend?',
        selectionOptions,
      ),
    );
    if (!selectedUses) return;
  }
  const martialArtsDie = (
    feat.actor!.system.scale['alternate-monk'][
      'martial-arts'
    ]! as ScaleValueTypeDice
  ).die;
  await spendKi(feat.actor!, selectedUses);
  const res = await rollUtils.rollDice(
    `${GENTLING_TOUCH_DICE_MULTIPLIER + (selectedUses - 1)}${martialArtsDie}`,
    {
      entity: feat.actor!,
      chatMessage: true,
    },
  );
  await genericUtils.sleep(2000);
  const target = workflow.targets.first()! as Token;
  if (res.roll.total < target.actor!.system.attributes.hp.value) return;
  await runActivity(feat, 'apply', [target]);
};

const macro: CPRMacro = {
  identifier: 'ac55eGentlingTouchMysticTechnique',
  name: 'Mystic Techniques: Gentling Touch',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 0,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
