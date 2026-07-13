import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { DamageActivity } from 'fvtt-types/Activity.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity, token, sourceToken, targetToken },
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!ditem || !ditem.totalDamage) return;
  if (!targetToken) return;
  if (!sourceToken) return;
  if (targetToken.document.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE)
    return;
  const {
    utils: {
      actorUtils,
      dialogUtils,
      effectUtils,
      genericUtils,
      itemUtils,
      rollUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor)) return;
  if (tokenUtils.getDistance(token, targetToken) > 30) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const rage = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eRageEffect',
  );
  if (!rage) return;
  const spectralWarriors = itemUtils.getItemByIdentifier(
    feat.actor,
    'ac55eSpectralWarriors',
  );
  if (!spectralWarriors) return;
  const space =
    spectralWarriors.flags['alternate-classes-55e']?.spectralWarriorsSpace;
  if (space !== feat.actor.uuid) return;
  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await dialogUtils.confirm(
    feat.name,
    `Send your Spectral Warriors to protect ${targetToken.name}?`,
    { userId },
  );
  if (!selection) return;
  await genericUtils.setFlag(
    spectralWarriors,
    'alternate-classes-55e',
    'spectralWarriorsSpace',
    targetToken.actor!.uuid,
  );
  await actorUtils.setReactionUsed(feat.actor);
  const res = await rollUtils.rollDice(`3${exploitDie}`, { chatMessage: true });
  workflowUtils.modifyDamageAppliedFlat(ditem, -res.roll.total);
  const vengefulAncestors = itemUtils.getItemByIdentifier(
    feat.actor,
    'ac55eVengefulAncestors',
  ) as Item<'feat'> | undefined;
  if (vengefulAncestors) {
    const damageActivity = (await getActivityData(
      vengefulAncestors,
      'damage',
    )) as DamageActivity;
    damageActivity.damage.parts[0].bonus = res.roll.total;
    damageActivity.damage.parts[0].types = ['radiant'];
    await workflowUtils.syntheticActivityDataRoll(
      damageActivity,
      vengefulAncestors,
      feat.actor,
      [sourceToken],
    );
  }
  await genericUtils.setFlag(
    spectralWarriors,
    'alternate-classes-55e',
    'spectralWarriorsSpace',
    feat.actor!.uuid,
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eSpectralShield',
  name: 'Path Of The Ancestors: Spectral Shield',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneApplyDamage',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
