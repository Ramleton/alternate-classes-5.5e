import { getActivityData } from 'automation/utils.js';
import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { getExploitUsesRemaining } from 'exploits/utils/exploitUtils.js';
import { DamageActivity } from 'fvtt-types/Activity.js';

const handleSpikedRetribution: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const effect = entity as unknown as ActiveEffect;
  if (effect.disabled) return;
  const item = effect.parent as Item<'equipment'>;
  if (!item.system.equipped) return;
  if (!workflow.hitTargets.size) return;
  const {
    utils: { constants, dialogUtils, itemUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.meleeAttacks.some((type) => type === actionType)) return;
  const actor = item.actor as Actor5e;
  const spikedRetribution = itemUtils.getItemByIdentifier(
    actor,
    'ac55eSpikedRetribution',
  ) as Item<'feat'> | undefined;
  if (!spikedRetribution) return;
  const damageActivity = (await getActivityData(
    spikedRetribution,
    'damage',
  )) as DamageActivity | undefined;
  if (!damageActivity) return;
  let selection = false;
  if (getExploitUsesRemaining(spikedRetribution)) {
    selection = await dialogUtils.confirm(
      'Spiked Retribution',
      'Spend an exploit die to add it to the damage roll?',
      { userId: socketUtils.firstOwner(actor, true) },
    );
  }
  if (selection) {
    const exploitDie = getAlternateMartialExploitDie(actor)!;
    const strMod = actor.system.abilities.str.mod;
    damageActivity.damage.parts[0].custom.formula = `1${exploitDie} + ${strMod}`;
  }
  await workflowUtils.syntheticActivityDataRoll(
    damageActivity,
    spikedRetribution,
    actor,
    [workflow.token!],
  );
};

const handleGrappleDamage: MacroFunction = async ({
  trigger: { entity, token, target },
}) => {
  const effect = entity as unknown as ActiveEffect;
  if (effect.disabled) return;
  if (!target) return;
  const {
    utils: { genericUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const item = effect.parent as Item<'equipment'>;
  if (!item.system.equipped) return;
  if (!tokenUtils.isGrappledBy(target, token)) return;
  const activity = Object.values(item.system.activities.contents).find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) =>
      a.midiProperties.identifier === 'PathOfBloodAndIron.grappleDamage',
  ) as DamageActivity | null;
  if (!activity) return;
  const grappleDamageActivity = genericUtils.duplicate(
    activity,
  ) as DamageActivity;
  const exploitDie = getAlternateMartialExploitDie(item.actor!);
  grappleDamageActivity.damage.parts[0].custom.formula = `1${exploitDie}`;
  await workflowUtils.syntheticActivityDataRoll(
    grappleDamageActivity,
    item,
    item.actor!,
    [target],
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eSpikedArmorEnchant',
  name: 'Path of Blood and Iron: Spiked Armor Enchant',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetAttackRollComplete',
        macro: handleSpikedRetribution,
        priority: 0,
      },
    ],
  },
  combat: [
    {
      pass: 'turnStartNear',
      macro: handleGrappleDamage,
      priority: 0,
    },
  ],
};

export default macro;
