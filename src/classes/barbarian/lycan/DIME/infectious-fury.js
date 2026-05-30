if (workflow.item.system.type.value === "natural" &&
	workflow.hitTargets.size > 0 &&
	workflow.actor.effects.some(e => e.name.toLowerCase() === "rage")
) {
  return MidiQOL.completeActivityUse(macroActivity);
}