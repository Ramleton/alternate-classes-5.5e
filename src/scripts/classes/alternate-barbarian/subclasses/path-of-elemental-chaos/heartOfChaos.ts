import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { DamageActivity } from 'fvtt-types/Activity.js';
import { DamageType } from 'types/damage.js';

export const getElementDamage = (actor: Actor5e): DamageType | void => {
  const {
    utils: { effectUtils, itemUtils },
  } = chrisPremades;
  const controlledChaos = itemUtils.getItemByIdentifier(
    actor,
    'ac55eControlledChaos',
  );
  if (!controlledChaos) {
    const rage = effectUtils.getEffectByIdentifier(actor, 'ac55eRageEffect');
    if (!rage) return;
  }
  ['air', 'fire', 'water'].forEach((element) => {
    const item = itemUtils.getItemByIdentifier(
      actor,
      `ac55ePathOfElementalChaosElement${element.capitalize()}`,
    );
    if (item) {
      if (element === 'air') return 'lightning';
      if (element === 'water') return 'cold';
      return 'fire';
    }
  });
};

const primevalRebuke: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const {
    utils: {
      actorUtils,
      constants,
      dialogUtils,
      effectUtils,
      itemUtils,
      socketUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.meleeAttacks.some((type) => type === actionType)) return;
  const controlledChaos = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eControlledChaos',
  );
  if (!controlledChaos) {
    const rage = effectUtils.getEffectByIdentifier(
      feat.actor!,
      'ac55eRageEffect',
    );
    if (!rage) return;
  }
  const target = workflow.token!;
  const damageType = getElementDamage(feat.actor!);
  if (!damageType) return;
  const damageActivity = (await getActivityData(feat, 'damage')) as
    DamageActivity | undefined;
  if (!damageActivity) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const selection = dialogUtils.confirm(
    feat.name,
    "You've been hit by a melee attack, use Primeval Rebuke?",
    {
      userId: socketUtils.firstOwner(feat, true),
    },
  );
  if (!selection) return;
  damageActivity.damage.parts[0].custom.formula = `2${exploitDie}`;
  damageActivity.damage.parts[0].types = [damageType];
  await workflowUtils.syntheticActivityDataRoll(
    damageActivity,
    feat,
    feat.actor!,
    [target],
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eHeartOfChaos',
  name: 'Path Of Elemental Chaos: Heart Of Chaos',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetAttackRollComplete',
        macro: primevalRebuke,
        priority: 0,
      },
    ],
  },
};

export default macro;
