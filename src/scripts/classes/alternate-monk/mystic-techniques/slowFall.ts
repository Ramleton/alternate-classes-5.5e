import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const SLOW_FALL_MULTIPLIER = 5;

const handle: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  if (!ditem) return;
  if (workflow.item.flags['chris-premades']?.info?.identifier !== 'fall')
    return;
  if (feat.actor!.statuses.has('restrained')) return;
  if (feat.actor!.statuses.has('grappled')) return;
  if (feat.actor!.statuses.has('incapacitated')) return;
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  const monkLevel = feat.actor!.classes['alternate-monk'].system.levels;
  const damageReduction = monkLevel * SLOW_FALL_MULTIPLIER;
  workflowUtils.modifyDamageAppliedFlat(ditem, -damageReduction);
};

const macro: CPRMacro = {
  identifier: 'ac55eSlowFallMysticTechnique',
  name: 'Mystic Techniques: Slow Fall',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
