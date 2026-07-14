import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.hitTargets.size) return;
  if (workflow.activity.attack.ability !== 'str') return;
  if (workflow.isCritical) return;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  const {
    utils: {
      constants,
      dialogUtils,
      effectUtils,
      genericUtils,
      socketUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  const rage = effectUtils.getEffectByIdentifier(
    feat.actor!,
    'ac55eRageEffect',
  );
  if (!rage) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    'Do you want to end your Rage to turn your attack into an automatic Critical Hit?',
    {
      userId: socketUtils.firstOwner(feat, true),
    },
  );
  if (!selection) return;
  await rage.delete();
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eMightyBlow',
  name: 'Path of the Champion: Mighty Blow',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
