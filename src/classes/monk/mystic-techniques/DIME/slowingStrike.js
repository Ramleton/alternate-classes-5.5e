if (
  workflow.hitTargets.size &&
  workflow.activity.actionType === 'mwak' &&
  (workflow.item.system.type.value === 'simpleM' ||
    (workflow.item.system.type.value === 'martialM' &&
      !workflow.item.system.properties.some((p) => p === 'hvy' || p === 'spc')))
) {
  return MidiQOL.completeActivityUse(macroActivity);
}
