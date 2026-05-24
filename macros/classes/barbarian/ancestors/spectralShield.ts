import { activityUtils, actorUtils, dialogUtils, effectUtils, genericUtils, itemUtils, socketUtils, tokenUtils, workflowUtils } from '../../../../../utils.js';
async function shieldHelper(token, sourceToken, targetToken, ditem) {
	if (actorUtils.hasUsedReaction(token.actor)) return;
	let rageEffect = effectUtils.getEffectByIdentifier(token.actor, 'ac55eRage');
	if (!rageEffect) return;
	let spectralShield = itemUtils.getItemByIdentifier(token.actor, 'ac55eSpectralShield');
	if (!spectralShield) return;
	let selection = await dialogUtils.confirm(spectralShield.name, genericUtils.format('CHRISPREMADES.Macros.SpiritShield.Damage', {item: spectralShield.name, name: targetToken.document.name}), {userId: socketUtils.firstOwner(token.actor, true)});
	if (!selection) return;
	let result = await workflowUtils.syntheticItemRoll(spectralShield, [token], {consumeResources: true, userId: socketUtils.firstOwner(token.actor, true)});
	workflowUtils.modifyDamageAppliedFlat(ditem, -result.damageRolls[0].total);
	let vengefulAncestors = itemUtils.getItemByIdentifier(token.actor, 'ac55eVengefulAncestors');
	if (vengefulAncestors) {
		let activity = activityUtils.getActivityByIdentifier(vengefulAncestors, 'damage', {strict: true});
		if (!activity) return true;
		let featureData = genericUtils.duplicate(vengefulAncestors.toObject());
		featureData.system.activities[activity.id].damage.parts[0].bonus = result.damageRolls[0].total;
		await workflowUtils.syntheticItemDataRoll(featureData, token.actor, [sourceToken]);
	}
	return true;
}
async function damageApplication({trigger: {sourceToken, targetToken}, ditem}) {
	let nearbyTokens = tokenUtils.findNearby(targetToken, 30, 'ally', {includeIncapacitated: false, includeToken: true});
	for (let i of nearbyTokens) {
		let shielded = await shieldHelper(i, sourceToken, targetToken, ditem);
		if (shielded) break;
	}
}
export const ac55eSpectralShield = {
	name: 'Spectral Shield',
	version: '1.0.0',
	rules: 'modern',
	midi: {
		actor: [
			{
				pass: 'sceneApplyDamage',
				macro: damageApplication,
				priority: 250
			}
		]
	}
};
