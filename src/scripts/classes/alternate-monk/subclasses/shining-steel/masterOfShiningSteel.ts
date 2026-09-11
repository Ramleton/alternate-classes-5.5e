import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  const {
    utils: { dialogUtils, genericUtils, itemUtils, rollUtils, socketUtils },
  } = chrisPremades;
  const signatureWeapon = itemUtils.getEffectByIdentifier(
    workflow.item,
    'ac55eSignatureWeapon',
  );
  if (!signatureWeapon) return false;
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses!.value) return false;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  if (!selection) return;
  const monkLevel = feat.actor!.classes['alternate-monk'].system.levels;
  const roll = await rollUtils.replaceD20(workflow.attackRoll, monkLevel);
  await workflow.setAttackRoll(roll);
  await genericUtils.update(feat, {
    'system.uses.spent': feat.system.uses!.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eMasterOfShiningSteel',
  name: 'Shining Steel: Master of Shining Steel',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: handle,
        priority: 50,
      },
    ],
  },
};

export default macro;
