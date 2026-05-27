async function touchOfLife({ trigger: { entity: item }, workflow }) {
  const altMonk = itemUtils.getItemByIdentifier(item.actor, 'altMonk');
  if (!altMonk) return;
  const altMonkLevels = altMonk.system.levels;
  if (altMonkLevels < 6) return;
  if (!workflow.targets.size) return;
  const target = workflow.targets.first();
  const targetActor = target.actor;
  if (!targetActor) return;
  const conditions = [];
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
  if (conditions.length === 1) {
    selection = conditions[0];
  }
  else {
    selection = await dialogUtils.selectDocumentDialog(
      item.name,
      'CHRISPREMADES.Generic.SelectRemoveCondition',
      conditions,
      { sortAlphabetical: true },
    );
  }
  await genericUtils.remove(selection);
}

export const ac55eTouchOfLife = {
  name: 'Touch of Life',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: touchOfLife,
        priority: 100,
        activities: ['heal'],
      },
    ],
  },
};
