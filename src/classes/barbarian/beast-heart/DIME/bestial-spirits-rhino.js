const sizeMap = {
	'tny': 1,
	'sml': 2,
	'med': 3,
	'lrg': 4,
	'hug': 5,
	'grg': 6
};

if (
	workflow.hitTargets.size > 0 &&
	['mwak', 'msak'].includes(workflow.activity.getActionType(workflow.attackMode)) &&
	sizeMap[workflow.hitTargets.first().actor.system.traits.size] <= sizeMap[workflow.actor.system.traits.size]
) {
  return MidiQOL.completeActivityUse(macroActivity);
}