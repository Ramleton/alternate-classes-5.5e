import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { CombinedKeys, DynamicSpells, getSpellData, isSpellObject } from 'automation/spellUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { DamageType } from '../../../../types/damage.js';
import damageWorkflow from './divineSmiteDamage.js';

const pre = async (
  actor: Actor5e,
  workflow: Workflow,
): Promise<DynamicSpells[CombinedKeys] | undefined> => {
  if (!workflow.hitTargets.size)
    return;
  const { utils: { dialogUtils, workflowUtils } } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (actionType !== 'mwak')
    return;
  const spellDetails = getSpellData(actor);
  if (!spellDetails.hasSpellSlots)
    return;
  const options: [`Level ${number}`, DynamicSpells[CombinedKeys]][] = Object
    .values(spellDetails)
    .filter(d => isSpellObject(d))
    .filter(d => d.value) // Only show spell levels with remaining slots
    .map(d => [`Level ${d.level}`, d]);
  const selection = await dialogUtils.buttonDialog(
    'Divine Smite',
    'Select a spell level to cast Divine Smite at',
    options,
  );
  return selection;
};

const during = async (
  feat: Item<'feat'>,
  spellData: DynamicSpells[CombinedKeys],
  damageType: DamageType,
) => {
  const spellLevel = Math.min(spellData.level, 5);
  const dmgFormula = `${1 + spellLevel}d8`;
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.divineSmite.damage',
    {
      formula: dmgFormula,
      damageType,
    },
  );
  return;
};

interface DivineSmiteWorkflowArgs {
  trigger: {
    entity: Item<'feat'>;
  };
  workflow: Workflow;
  damageType: DamageType;
}

type DivineSmiteWorkflow = (__0: DivineSmiteWorkflowArgs) => Promise<void>;

const templateWorkflow: DivineSmiteWorkflow = async ({
  trigger: { entity },
  workflow,
  damageType,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat.actor, workflow);
  if (!res1) return;
  await during(feat, res1, damageType);
};

const divineSmiteMacroFactory = (damageType: DamageType): CPRMacro => {
  const workflow: MidiMacroFunction = async (data) => {
    const feat = data.trigger.entity as Item<'feat'>;
    await templateWorkflow({
      ...data,
      trigger: { ...data.trigger, entity: feat },
      damageType,
    });
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
