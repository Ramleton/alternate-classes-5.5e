import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses!.value) return;
  const {
    utils: { dialogUtils, effectUtils, socketUtils },
  } = chrisPremades;
  if (
    !effectUtils.getEffectByIdentifier(feat.actor!, 'ac55eNecroticHuskEffect')
  )
    return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor!, true),
  });
  if (!selection) return;
  await runActivity(
    feat,
    'save',
    Array.from(workflow.hitTargets as Set<Token>),
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eNecroticHusk',
  name: 'Undying: Necrotic Husk',
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
