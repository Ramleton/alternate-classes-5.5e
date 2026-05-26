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

async function preDeflectMissile({
  trigger: { entity: item },
  workflow,
  ditem,
  altMonkLevels,
  mysticTechniques,
  astralArmorEffect,
  astralWarrior,
}) {
  if (ditem.newHP === ditem.oldHP || !ditem.isHit) return false;
  if (actorUtils.hasUsedReaction(item.actor)) return false;
  if (!workflowUtils.isAttackType(workflow, 'attack')) return false;
  const actionType = workflowUtils.getActionType(workflow);
  /**
   * 10th level Astral Warriors can benefit from this technique's 11th level
   * bonus one level early
   */
  const minLevel = astralWarrior ? 10 : 11;
  const allowedAttacks =
    altMonkLevels >= minLevel ? ['rwak', 'rsak'] : ['rwak'];
  if (!allowedAttacks.includes(actionType)) return false;
  /**
   * If the monk is a 10th level Astral Warrior, and they have the Astral Armor
   * effect, then they can use this technique for free
   */
  if (
    !mysticTechniques?.system?.uses?.value &&
    !astralArmorEffect &&
    altMonkLevels >= 10
  )
    return false;
  return true;
}

async function deflectMissile({
  trigger: { entity: item },
  workflow,
  ditem,
  altMonkLevels,
  mysticTechniques,
  astralWarrior,
}) {
  let selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  if (!selection) return false;
  let reduceActivity = activityUtils.getActivityByIdentifier(item, 'use', {
    strict: true,
  });
  if (!reduceActivity) return false;
  let targetWorkflow = await workflowUtils.syntheticActivityRoll(
    reduceActivity,
    [workflow.hitTargets.first()],
  );
  workflowUtils.modifyDamageAppliedFlat(
    ditem,
    -targetWorkflow.utilityRolls[0].total,
  );
  if (ditem.newHP != ditem.oldHP) return false;
  if (!mysticTechniques?.system?.uses?.value) return false;
  let nearby = tokenUtils.findNearby(workflow.hitTargets.first(), 60, 'all', {
    includeIncapacitated: true,
  });
  if (!nearby.length) return false;
  let userId = socketUtils.firstOwner(item.actor, true);
  let targetSelection = await dialogUtils.selectTargetDialog(
    item.name,
    'CHRISPREMADES.Macros.DeflectAttacks.UseAndTarget',
    nearby,
    { skipDeadAndUnconscious: false, userId, buttons: 'yesNo' },
  );
  if (!targetSelection || !targetSelection[0]) return false;
  const distance = tokenUtils.getDistance(
    targetSelection[0],
    workflow.hitTargets.first(),
  );
  let attackDisadvantageEffect: any = undefined;
  if (distance > 20) {
    const effectData = {
      name: 'Long Range Deflect Disadvantage',
      icon: item.img,
      origin: item.uuid,
      duration: { turns: 1 },
      changes: [
        {
          key: 'flags.midi-qol.disadvantage.attack.all',
          mode: 0,
          value: 1,
          priority: 0,
        },
      ],
    };
    attackDisadvantageEffect = await effectUtils.createEffect(
      item.actor,
      effectData,
    );
  }
  let activity = activityUtils.getActivityByIdentifier(item, 'attack', {
    strict: true,
  });
  if (!activity) return false;
  let activityData = genericUtils.duplicate(activity.toObject());
  activityData.damage.parts[0].types = [workflow.defaultDamageType];
  await workflowUtils.syntheticActivityDataRoll(
    activityData,
    item,
    item.actor,
    [targetSelection[0]],
    { consumeResources: true, consumeUsage: true },
  );
  if (attackDisadvantageEffect) {
    await attackDisadvantageEffect.delete();
  }
  if (astralWarrior && altMonkLevels >= 10)
    mysticalDefenseBonus({ trigger: { entity: item } });
  return true;
}

async function postDeflectMissile({
  trigger: { entity: item },
  workflow,
  ditem,
  altMonkLevels,
  mysticTechniques,
  astralArmorEffect,
  astralWarrior,
}) {
  /**
   * If the monk is a 10th level Astral Warrior, and they have the Astral Armor
   * effect, then they can use this technique for free
   */
  if (astralArmorEffect && altMonkLevels >= 10) return;
  await genericUtils.update(mysticTechniques, {
    'system.uses.spent': mysticTechniques.system.uses.spent + 1,
  });
}

async function deflectMissileWorkflow({
  trigger: { entity: item },
  workflow,
  ditem,
}) {
  const altMonk = itemUtils.getItemByIdentifier(item.actor, 'altMonk');
  if (!altMonk) return;
  const altMonkLevels = altMonk.system.levels;
  let mysticTechniques = itemUtils.getItemByIdentifier(
    item.actor,
    'mysticTechniques',
  );
  const astralArmorEffect = effectUtils.getEffectByIdentifier(
    item.actor,
    'ac55eAstralArmorEffect',
  );
  const astralWarrior = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eAstralWarrior',
  );
  const res = await preDeflectMissile({
    trigger: { entity: item },
    workflow,
    ditem,
    altMonkLevels,
    mysticTechniques,
    astralArmorEffect,
    astralWarrior,
  });
  if (!res) return;
  const res2 = await deflectMissile({
    trigger: { entity: item },
    workflow,
    ditem,
    altMonkLevels,
    mysticTechniques,
    astralWarrior,
  });
  if (!res2) return;
  await postDeflectMissile({
    trigger: { entity: item },
    workflow,
    ditem,
    altMonkLevels,
    mysticTechniques,
    astralArmorEffect,
    astralWarrior,
  });
}

function mysticalDefenseBonus({ trigger: { entity: item } }) {
  const mysticalDefense = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eMysticalDefense',
  );
  const effectData = {
    name: 'Mystical Defense: Unarmed Strike Bonus',
    icon: mysticalDefense.img,
    origin: mysticalDefense.uuid,
    changes: [
      {
        key: 'flags.automated-conditions-5e.damage.bonus',
        mode: 0,
        value:
          "bonus=@scale.alternate-monk.martial-arts; once; \
          item.flags['chris-premades']?.info?.identifier === 'unarmedStrike';",
      },
    ],
  };
  effectUtils.createEffect(item.actor, effectData);
}

export const ac55eDeflectMissile = {
  name: 'Deflect Missile',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: deflectMissileWorkflow,
        priority: 100,
      },
    ],
  },
};
