import { activityUtils, actorUtils, dialogUtils, effectUtils, genericUtils, itemUtils, socketUtils, tokenUtils, workflowUtils } from '../../../../../utils.js';

async function typhoonStrike({trigger: {entity: item}, workflow, ditem}) {
	
}

export const ac55eTyphoonStrike = {
	name: 'Typhoon Strike',
	version: '1.3.141',
	rules: 'modern',
	midi: {
		actor: [
			{
				pass: 'attackRollComplete',
				macro: typhoonStrike,
				priority: 100
			}
		]
	}
};