if (workflow.hitTargets.size > 0 &&
	workflow.activity.ability === 'str' &&
	workflow.actor.effects.some(e => e.name.toLowerCase() === 'reckless attack')
) {
  return MidiQOL.completeActivityUse(macroActivity);
}