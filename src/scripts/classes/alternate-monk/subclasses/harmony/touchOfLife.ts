import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  const feat = item as Item<'feat'>;
  const monkLevel = feat.actor!.classes['alternate-monk'].system.levels;
  if (monkLevel < 6) return;
  if (!workflow.targets.size) return;
  const target = workflow.targets.first()!;
  const targetActor = target.actor as unknown as Actor;
  if (!targetActor) return;
  const conditions: ActiveEffect[] = [];
  const {
    utils: { dialogUtils, effectUtils, genericUtils },
  } = chrisPremades;
  const diseased = effectUtils.getEffectByStatusID(targetActor, 'diseased');
  const blinded = effectUtils.getEffectByStatusID(targetActor, 'blinded');
  const deafened = effectUtils.getEffectByStatusID(targetActor, 'deafened');
  const paralyzed = effectUtils.getEffectByStatusID(targetActor, 'paralyzed');
  const poisoned = effectUtils.getEffectByStatusID(targetActor, 'poisoned');
  const stunned = effectUtils.getEffectByStatusID(targetActor, 'stunned');
  if (diseased) conditions.push(diseased);
  if (blinded) conditions.push(blinded);
  if (deafened) conditions.push(deafened);
  if (paralyzed) conditions.push(paralyzed);
  if (poisoned) conditions.push(poisoned);
  if (stunned) conditions.push(stunned);
  let selection;
  if (!conditions.length) return;
  if (conditions.length === 1) {
    selection = conditions[0];
  } else {
    selection = await dialogUtils.selectDocumentDialog(
      item.name,
      'CHRISPREMADES.Generic.SelectRemoveCondition',
      conditions,
      { sortAlphabetical: true },
    );
  }
  await genericUtils.remove(selection);
};

const macro: CPRMacro = {
  identifier: 'ac55eTouchOfLife',
  name: 'Harmony: Touch of Life',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: handle,
        priority: 100,
        activities: ['heal'],
      },
    ],
  },
};

export default macro;
