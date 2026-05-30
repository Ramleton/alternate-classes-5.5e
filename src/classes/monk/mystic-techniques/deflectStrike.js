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

function preDeflectStrike({
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
  const allowedAttacks
    = altMonkLevels >= minLevel ? ['mwak', 'msak'] : ['mwak'];
  if (!allowedAttacks.includes(actionType)) return false;
  /**
   * If the monk is a 10th level Astral Warrior, and they have the Astral Armor
   * effect, then they can use this technique for free
   */
  if (
    !mysticTechniques?.system?.uses?.value
    && !astralArmorEffect
    && altMonkLevels >= 10
  )
    return false;
  return true;
}

async function deflectStrike({ trigger: { entity: item }, workflow, ditem }) {
  let selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  if (!selection) return;
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
  if (ditem.newHP != ditem.oldHP) return true;
  let distance = tokenUtils.getDistance(
    workflow.token,
    workflow.hitTargets.first(),
  );
  let validWeapons = item.actor.items.filter(
    i =>
      i.flags['chris-premades']?.info?.identifier === 'unarmedStrike'
      && i.system.range.reach >= distance,
  );
  if (!validWeapons.length) {
    genericUtils.notify('CHRISPREMADES.Macros.TrueStrike.NoWeapons', 'warn');
    return true;
  }
  let selectedWeapon;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  }
  else {
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      item.name,
      'CHRISPREMADES.Macros.TrueStrike.SelectWeapon',
      validWeapons,
    );
  }
  let activity = activityUtils.getActivityByIdentifier(
    selectedWeapon,
    'punch',
    {
      strict: true,
    },
  );
  if (!activity) return true;
  let activityData = genericUtils.duplicate(activity.toObject());
  await workflowUtils.syntheticActivityDataRoll(
    activityData,
    selectedWeapon,
    item.actor,
    [workflow.token],
    { consumeResources: true, consumeUsage: true },
  );
}

async function postDeflectStrike({
  trigger: { entity: item },
  workflow,
  ditem,
  altMonkLevels,
  mysticTechniques,
  astralArmorEffect,
  astralWarrior,
}) {
  if (astralWarrior && altMonkLevels >= 10)
    mysticalDefenseBonus({ trigger: { entity: item } });
  /**
   * If the monk is a 10th level Astral Warrior, and they have the Astral Armor
   * effect, then they can use this technique for free
   */
  if (astralArmorEffect && altMonkLevels >= 10) return;
  await genericUtils.update(mysticTechniques, {
    'system.uses.spent': mysticTechniques.system.uses.spent + 1,
  });
}

async function deflectStrikeWorkflow({
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
  const res = preDeflectStrike({
    trigger: { entity: item },
    workflow,
    ditem,
    altMonkLevels,
    mysticTechniques,
    astralArmorEffect,
    astralWarrior,
  });
  if (!res) return;
  const res2 = await deflectStrike({
    trigger: { entity: item },
    workflow,
    ditem,
  });
  if (!res2) return;
  await postDeflectStrike({
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
          'bonus=@scale.alternate-monk.martial-arts; once; \
          item.flags[\'chris-premades\']?.info?.identifier === \
          \'unarmedStrike\';',
      },
    ],
  };
  effectUtils.createEffect(item.actor, effectData);
}

export const ac55eDeflectStrike = {
  name: 'Deflect Strike',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: deflectStrikeWorkflow,
        priority: 100,
      },
    ],
  },
};
