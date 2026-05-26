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
  animationUtils,
  CONFIG,
  Sequence,
  ChatMessage,
} from '../../../../../utils.js';

async function attack({ workflow }) {
  if (
    activityUtils.getIdentifier(workflow.activity) === 'armorOfTheAsceticSave'
  )
    return;
  let remove = false;
  remove ||=
    workflow.damageRoll &&
    !(
      workflow.defaultDamageType === 'healing' ||
      workflow.defaultDamageType === 'temphp'
    );
  remove ||= workflowUtils.isAttackType(workflow, 'attack');
  remove ||= workflow.item.type === 'spell';
  if (!remove) return;
  let effect = effectUtils.getEffectByIdentifier(
    workflow.actor,
    'ac55eArmorOfTheAsceticSafe',
  );
  if (effect) await genericUtils.remove(effect);
}
async function targeted({ trigger: { entity: effect }, workflow }) {
  if (workflow.targets.size !== 1) return;
  let invalidTypes = Object.keys(CONFIG.DND5E.areaTargetTypes);
  if (invalidTypes.includes(workflow.item.system.target?.type)) return;
  if (workflow.item.system.type?.value === 'spellFeature') return;
  let targetToken = workflow.targets.first();
  if (targetToken.document.disposition === workflow.token.document.disposition)
    return;
  if (workflow.item.type === 'spell') {
    if (workflowUtils.isSustainedRoll(workflow)) return;
  }
  let originItem = await effectUtils.getOriginItem(effect);
  let feature = activityUtils.getActivityByIdentifier(
    originItem,
    'armorOfTheAsceticSave',
    { strict: true },
  );
  if (!feature) return;
  let saveWorkflow = await workflowUtils.syntheticActivityRoll(feature, [
    workflow.token,
  ]);
  if (!saveWorkflow.failedSaves.size) return;
  let playAnimation = itemUtils.getConfig(originItem, 'playAnimation');
  if (playAnimation && animationUtils.jb2aCheck()) {
    new Sequence()
      .effect()
      .atLocation(targetToken)
      .scaleToObject(1.25)
      .fadeIn(500)
      .fadeOut(500)
      .playbackRate(2)
      .file('jb2a.energy_field.02.above.blue')
      .play();
  }
  ChatMessage.create({
    speaker: workflow.chatCard.speaker,
    content: genericUtils.translate('CHRISPREMADES.Macros.Sanctuary.Failed'),
  });
  workflow.aborted = true;
}

export let ac55eArmorOfTheAsceticSafe = {
  name: 'Armor of the Ascetic: Safe',
  version: '1.2.29',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: attack,
        priority: 50,
      },
      {
        pass: 'targetPreItemRoll',
        macro: targeted,
        priority: 50,
      },
    ],
  },
};
