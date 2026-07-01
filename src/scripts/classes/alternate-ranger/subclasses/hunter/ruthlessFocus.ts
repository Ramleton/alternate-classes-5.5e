import CPRMacro, {
  MidiActiveEffect,
  MidiMacroFunction,
} from 'chris-premades/macro.js';

const ruthlessFocusDamage: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
  ditem,
}) => {
  if (workflow.item.name !== 'Horde Breaker') return;
  if (!ditem) return;
  const effect = entity as MidiActiveEffect;
  const sourceEffect = (await fromUuid(
    effect.origin,
  )) as MidiActiveEffect | null;
  console.log(sourceEffect);
  if (!sourceEffect) return;
  const actor = sourceEffect.parent as Actor5e;
  const {
    utils: { itemUtils, workflowUtils },
  } = chrisPremades;
  if (!itemUtils.getItemByIdentifier(actor, 'ac55eRuthlessFocus')) return;
  const bonusDamage = Math.max(1, actor.system.abilities.wis.mod);
  workflowUtils.modifyDamageAppliedFlat(ditem, bonusDamage);
};

const macro: CPRMacro = {
  identifier: 'ac55eRuthlessFocusHordeBreakerBonus',
  name: 'Hunter: Ruthless Focus (Horde Breaker)',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: ruthlessFocusDamage,
        priority: 100,
      },
    ],
  },
};

export default macro;
