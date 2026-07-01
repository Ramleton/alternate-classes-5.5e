import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getQuarryDie, isQuarry } from '../../utils/quarryUtils.js';

const attackRollBoost: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return false;
  if (!feat.system.uses?.value) return false;
  const quarryDie = getQuarryDie(feat.actor);
  if (!quarryDie) return false;
  if (!workflow.targets.size) return false;
  if (!workflow.attackRoll?.total) return false;
  const target = workflow.targets.first() as Token;
  if (target.actor!.system.attributes.ac.value < workflow.attackRoll.total)
    return false;
  if (!isQuarry(feat.actor, target.actor!)) return false;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses.spent + 1,
  });
  await workflowUtils.bonusAttack(workflow, quarryDie);
};

const macro: CPRMacro = {
  identifier: 'ac55ePreciseStrikes',
  name: 'Deep Stalker: Precise Strikes',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: attackRollBoost,
        priority: 100,
      },
    ],
  },
};

export default macro;
