import {
  activityUtils,
  actorUtils,
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  tokenUtils,
  workflowUtils,
} from '../../../../../utils.js';

async function gentlingTouch({ trigger: { entity: item }, workflow, ditem }) {
  if (workflow.targets.size !== 1) return;
  let targetActor = workflow.targets.first().actor;
  let utilityRoll = workflow.utilityRolls[0];
  if (!utilityRoll) return;
  if (targetActor.system.attributes.hp.value > utilityRoll.total) return;
  let effect = itemUtils.getEffectByIdentifier(item, 'effect');
  if (!effect) return;
  await effectUtils.createEffect(targetActor, effect, {
    origin: item.uuid,
  });
}

export const ac55eGentlingTouch = {
  name: 'Gentling Touch',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: gentlingTouch,
        priority: 100,
        activity: ['use'],
      },
    ],
  },
};
