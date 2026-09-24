import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
  ditem,
}) => {
  if (!ditem || !ditem.damageDetail.some((d) => d.type === 'fire')) return;
  const feat = entity as Item<'feat'>;
  await runActivity(
    feat,
    'apply',
    Array.from(workflow.hitTargets as Set<Token>),
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eAccursedFlames',
  name: 'Fiend: Accursed Flames',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'applyDamage',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
