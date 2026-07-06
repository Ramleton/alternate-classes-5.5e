import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';

const sentientStrike: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (
    workflow.item.flags['chris-premades']?.info?.identifier !==
    'ac55ePsiBladeItem'
  )
    return;
  if (!workflow.targets.size) return;
  const target = workflow.targets.first() as Token;
  if (workflow.attackRoll!.total! >= target.actor!.system.attributes.ac.value)
    return;
  const exploitDie = getAlternateMartialExploitDie(feat);
  if (!exploitDie) return;
  const {
    utils: { dialogUtils, itemUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  const psiPoints = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55ePsionicAwakening',
  ) as Item<'feat'>;
  if (!psiPoints || !psiPoints.system.uses?.value) return;
  const selection = await dialogUtils.confirm(
    'Sentient Strike',
    'You missed your attack. Spend 1 Psi Point to gain a bonus equal to your Exploit Die?',
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return;
  await workflowUtils.bonusAttack(workflow, `1d${exploitDie.faces}`);
};

const macro: CPRMacro = {
  identifier: 'ac55eEmpoweredBlades',
  name: 'Psiknife: Empowered Blades',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: sentientStrike,
        priority: 100,
      },
    ],
  },
};

export default macro;
