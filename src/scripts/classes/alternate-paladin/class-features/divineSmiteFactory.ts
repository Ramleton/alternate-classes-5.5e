import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { CombinedKeys, DynamicSpells, getSpellData, isSpellObject, spendSpellSlot } from 'automation/spellUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageType } from '../../../../types/damage.js';
import damageWorkflow from './divineSmiteDamage.js';

const pre = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<DynamicSpells[CombinedKeys] | undefined> => {
  if (!workflow.hitTargets.size)
    return;
  const { utils: { dialogUtils, workflowUtils } } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (actionType !== 'mwak')
    return;
  const spellDetails = getSpellData(feat.actor!);
  if (!spellDetails.hasSpellSlots)
    return;
  const options: [`Level ${number}`, number][] = Object
    .values(spellDetails)
    .filter(d => isSpellObject(d))
    .filter(d => d.value) // Only show spell levels with remaining slots
    .map(d => [`Level ${d.level}`, d.level]);
  const useDivineSmite = await dialogUtils.confirmUseItem(feat);
  if (!useDivineSmite)
    return;
  const selection = await dialogUtils.buttonDialog(
    'Divine Smite',
    'Select a spell level',
    options,
  );
  if (!selection)
    return;
  const spellData = spellDetails[`ac55eSpell${selection}` as CombinedKeys];
  return spellData;
};

export interface DivineSmiteData {
  formula: `${number}d8`;
  damageType: DamageType;
  level: number;
}

const during = async (
  feat: Item<'feat'>,
  spellData: DynamicSpells[CombinedKeys],
  damageType: DamageType,
) => {
  const dmgSpellLevel = Math.min(spellData.level, 5);
  const dmgFormula = `${1 + dmgSpellLevel}d8` as `${number}d8`;
  const { utils: { genericUtils } } = chrisPremades;
  const smiteData: DivineSmiteData = {
    formula: dmgFormula,
    damageType,
    level: dmgSpellLevel,
  };
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.divineSmite.damage',
    smiteData,
  );
  return;
};

const divineSmiteMacroFactory = (damageType: DamageType): CPRMacro => {
  const workflow: MidiMacroFunction = async (data) => {
    const { trigger: { entity }, workflow } = data;
    const feat = entity as Item<'feat'>;
    if (!feat.actor)
      return;
    const res1 = await pre(feat, workflow);
    if (!res1)
      return;
    await during(feat, res1, damageType);
    await spendSpellSlot(feat.actor, res1.type, res1.level);
  };

  const damageName = damageType.charAt(0).toUpperCase()
    + damageType.slice(1);

  return {
    identifier: `ac55eDivineSmite${damageName}`,
    name: `Divine Smite: ${damageName}`,
    source: 'Alternate Classes 5.5e',
    version: '1.0.0',
    rules: 'modern',
    midi: {
      actor: [
        {
          pass: 'attackRollComplete',
          macro: workflow,
          priority: 900,
        },
        {
          pass: 'damageRollComplete',
          macro: damageWorkflow,
          priority: 100,
        },
      ],
    },
  };
};

export default divineSmiteMacroFactory;
