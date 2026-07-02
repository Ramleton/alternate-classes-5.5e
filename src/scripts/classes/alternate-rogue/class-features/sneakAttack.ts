import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import {
  getSneakAttack,
  qualifiesForSneakAttack,
} from '../utils/sneakAttackUtils.js';

const prompt: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (!workflow.targets.size) return;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  const useSneakAttack =
    feat.actor!.flags['alternate-classes-55e']?.macros?.['sneak-attack'];
  if (useSneakAttack) return;
  if (!qualifiesForSneakAttack(feat, workflow)) return;
  const {
    utils: { genericUtils, socketUtils },
  } = chrisPremades;
  const userId = socketUtils.firstOwner(feat.actor, true);
  const selection = await chrisPremades.utils.dialogUtils.confirmUseItem(feat, {
    userId,
  });
  if (!selection) return;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.sneak-attack',
    1,
  );
};

const damageBonus: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  const useSneakAttack =
    feat.actor!.flags['alternate-classes-55e']?.macros?.['sneak-attack'];
  if (!useSneakAttack) return;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  await genericUtils.unsetFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.sneak-attack',
  );
  const sneakAttack = getSneakAttack(feat.actor!);
  await workflowUtils.bonusDamage(workflow, sneakAttack.formula);
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses!.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eSneakAttack',
  name: 'Sneak Attack',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: prompt,
        priority: 150,
      },
      {
        pass: 'damageRollComplete',
        macro: damageBonus,
        priority: 100,
      },
    ],
  },
};

export default macro;
