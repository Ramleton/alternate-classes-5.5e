import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isQuarry } from '../utils/quarryUtils.js';

const prompt: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (feat.actor.classes['alternate-ranger']?.system?.levels < 20) return;
  const {
    utils: { constants, dialogUtils, genericUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  // Only apply to weapon attacks
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  // Only apply if the attack hit
  if (!workflow.hitTargets.size) return;
  const target = workflow.hitTargets.first() as Token;
  // Only apply if the target is the actor's quarry
  if (!isQuarry(feat, target)) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    `End your mark to deal the maximum possible damage to ${target.name}?`,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  if (!selection) return;
  await genericUtils.setFlag(
    feat.actor,
    'alternate-classes-55e',
    'foeSlayer',
    true,
  );
};

const maximizeDamage: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: { effectUtils },
  } = chrisPremades;
  if (!feat.actor!.flags['alternate-classes-55e']?.foeSlayer) return;
  const newDamageRolls = workflow.damageRolls.map(
    async (roll) =>
      await Roll.create(roll.formula).evaluate({ maximize: true }),
  );
  await workflow.setDamageRolls(await Promise.all(newDamageRolls));
  const target = workflow.hitTargets.first() as Token;
  const targetEffect = effectUtils.getEffectByIdentifier(
    target.actor!,
    'ac55eRangersQuarryTarget',
  );
  await targetEffect!.delete();
};

const post: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor!.flags['alternate-classes-55e']?.foeSlayer) return;
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.unsetFlag(
    feat.actor!,
    'alternate-classes-55e',
    'foeSlayer',
  );
  if (!ditem || ditem.newHP > 50) return;
  const target = workflow.hitTargets.first() as Token;
  const saveWorkflow = await runActivity(feat, 'save', [target]);
  if (!saveWorkflow) return;
  for (const failedTarget of saveWorkflow.failedSaves) {
    failedTarget.actor!.system.attributes.hp.value = 0;
  }
};

const macro: CPRMacro = {
  identifier: 'ac55eFoeSlayer',
  name: 'Alternate Ranger: Foe Slayer',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: prompt,
        priority: 100,
      },
      {
        pass: 'damageRollComplete',
        macro: maximizeDamage,
        priority: 990,
      },
      {
        pass: 'rollFinished',
        macro: post,
        priority: 990,
      },
    ],
  },
};

export default macro;
