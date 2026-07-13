import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { CunningStrikeSubclassFeatureHandler } from '../../types/cunningStrike.js';
import { reduceSneakAttack } from '../../utils/sneakAttackUtils.js';

export const handleMindRend: CunningStrikeSubclassFeatureHandler = async ({
  trigger: { entity },
  workflow,
  selectedFeature,
  target,
}) => {
  const {
    utils: { dialogUtils, itemUtils, socketUtils },
  } = chrisPremades;
  const feat = entity as Item<'feat'>;
  const mentalScourge = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eMentalScourge',
  ) as Item<'feat'> | undefined;
  if (!mentalScourge)
    return await runActivity(selectedFeature, 'save', [target]);
  const selection = await dialogUtils.confirm(
    'Mental Scourge',
    'Reduce Sneak Attack damage by another 2 dice to empower Mind Rend?',
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return await runActivity(selectedFeature, 'save', [target]);
  reduceSneakAttack(workflow, feat.actor!, 2);
  await runActivity(mentalScourge, 'save', [target]);
};

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
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
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
  await workflowUtils.bonusAttack(workflow, `1${exploitDie}`);
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
