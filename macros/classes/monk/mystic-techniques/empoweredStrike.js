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

async function empoweredStrike({ trigger: { entity: item }, workflow, ditem }) {
  if (!workflowUtils.isAttackType(workflow, 'attack')) return;
  if (workflowUtils.getActionType(workflow) !== 'mwak') return;
  if (!workflow.hitTargets.size) return;
  const opponentActor = workflow.hitTargets.first().actor;
  const mysticTechniques = itemUtils.getItemByIdentifier(
    item.actor,
    'mysticTechniques',
  );
  if (!mysticTechniques?.system?.uses?.value) return;
  if (!item.system.uses.value) return;
  const selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  if (!selection) return;
  const saveActivity = activityUtils.getActivityByIdentifier(item, 'save', {
    strict: true,
  });
  if (!saveActivity) return;
  const sizeMap = {
    tiny: 1,
    sm: 2,
    med: 3,
    lg: 4,
    huge: 5,
    grg: 6,
  };
  const saveAdvantage
    = sizeMap[opponentActor.system.traits.size]
      > sizeMap[item.actor.system.traits.size];
  let saveAdvantageEffect = undefined;
  if (saveAdvantage) {
    const effectData = {
      name: 'Empowered Strike Advantage',
      icon: item.img,
      origin: item.uuid,
      duration: { turns: 1 },
      changes: [
        {
          key: 'flags.midi-qol.advantage.save.str',
          mode: 0,
          value: 1,
          priority: 0,
        },
      ],
    };
    saveAdvantageEffect = await effectUtils.createEffect(
      opponentActor,
      effectData,
    );
  }
  const saveWorkflow = await workflowUtils.syntheticActivityRoll(saveActivity, [
    workflow.hitTargets.first(),
  ]);
  if (saveAdvantageEffect) await saveAdvantageEffect.delete();
  await genericUtils.update(mysticTechniques, {
    'system.uses.spent': mysticTechniques.system.uses.spent + 1,
  });
  await genericUtils.update(item, {
    'system.uses.spent': item.system.uses.spent + 1,
  });
  if (!saveWorkflow.saveResults[0].isFailure) return;
  const range = item.actor.system.abilities.wis.mod * 5;
  await tokenUtils.pushToken(
    workflow.token,
    workflow.hitTargets.first(),
    range,
  );
}

export const ac55eEmpoweredStrike = {
  name: 'Empowered Strike',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: empoweredStrike,
        priority: 100,
      },
    ],
  },
};
