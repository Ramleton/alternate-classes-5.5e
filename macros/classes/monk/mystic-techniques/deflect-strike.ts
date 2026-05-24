import { activityUtils, actorUtils, dialogUtils, effectUtils, genericUtils, itemUtils, socketUtils, tokenUtils, workflowUtils } from '../../../../../utils.js';

async function damageApplication({trigger: {entity: item}, workflow, ditem}) {
	if (ditem.newHP === ditem.oldHP || !ditem.isHit) return;
	if (actorUtils.hasUsedReaction(item.actor)) return;
	if (!workflowUtils.isAttackType(workflow, 'attack')) return;
	const altMonk = itemUtils.getItemByIdentifier(item.actor, 'altMonk');
	if (!altMonk) return;
	const altMonkLevels = altMonk.system.levels;
	const actionType = workflowUtils.getActionType(workflow);
	const allowedAttacks = altMonkLevels >= 11 ? ['mwak', 'msak'] : ['mwak'];
	if (!allowedAttacks.includes(actionType)) return;
	let mysticTechniques = itemUtils.getItemByIdentifier(item.actor, 'mysticTechniques');
	if (!mysticTechniques?.system?.uses?.value) return;
	let selection = await dialogUtils.confirmUseItem(item, {userId: socketUtils.firstOwner(item.actor, true)});
	if (!selection) return;
	let reduceActivity = activityUtils.getActivityByIdentifier(item, 'use', {strict: true});
	if (!reduceActivity) return;
	let targetWorkflow = await workflowUtils.syntheticActivityRoll(reduceActivity, [workflow.hitTargets.first()]);
	workflowUtils.modifyDamageAppliedFlat(ditem, -targetWorkflow.utilityRolls[0].total);
	if (ditem.newHP != ditem.oldHP) return;
	let unarmedStrike = itemUtils.getItemByIdentifier(item.actor, 'unarmedStrike');
	let activity = activityUtils.getActivityByIdentifier(unarmedStrike, 'punch', {strict: true});
	if (!activity) return;
	let activityData = genericUtils.duplicate(activity.toObject());
	await workflowUtils.syntheticActivityDataRoll(activityData, unarmedStrike, item.actor, [workflow.token], {consumeResources: true, consumeUsage: true});
	await genericUtils.update(mysticTechniques, {'system.uses.spent': mysticTechniques.system.uses.spent + 1});
}
export const ac55eDeflectStrike = {
	name: 'Deflect Strike',
	version: '1.3.141',
	rules: 'modern',
	midi: {
		actor: [
			{
				pass: 'targetApplyDamage',
				macro: damageApplication,
				priority: 100
			}
		]
	}
};