import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const pre = async (
  item: Item<'feat'>,
  workflow: Workflow,
): Promise<boolean> => {
  if (!workflow.hitTargets.size) return false;
  if (!workflow.isCritical) return false;
  if (item.actor!.system.details.level < 15) return false;
  if (!item.system.uses?.value) return false;
  const {
    utils: { dialogUtils, socketUtils },
  } = chrisPremades;
  const selection = await dialogUtils.confirmUseItem(item, {
    userId: socketUtils.firstOwner(item.actor, true),
  });
  return selection;
};
const during = async (workflow: Workflow) => {
  const newDamageRolls = workflow.damageRolls.map(
    async (roll) =>
      await Roll.create(roll.formula).evaluate({ maximize: true }),
  );
  await workflow.setDamageRolls(await Promise.all(newDamageRolls));
};
const post = async (item: Item<'feat'>): Promise<void> => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.update(item, {
    'system.uses.spent': item.system.uses!.spent + 1,
  });
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}): Promise<void> => {
  const feat = item as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, workflow);
  if (!res1) return;
  await during(workflow);
  await post(feat);
};

const macro: CPRMacro = {
  identifier: 'ac55eDevastatingCritical',
  name: 'Devastating Critical',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: workflow,
        priority: 999,
      },
    ],
  },
};

export default macro;
