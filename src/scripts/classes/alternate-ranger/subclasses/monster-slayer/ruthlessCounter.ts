import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';
import { getValidWeapons } from 'automation/weaponUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!isQuarry(feat.actor!, workflow.actor!)) return;
  if (
    workflow.item.type !== 'spell' &&
    !(
      workflow.item.system.properties &&
      workflow.item.system.properties.has('mgc')
    )
  )
    return;
  const {
    utils: {
      actorUtils,
      dialogUtils,
      effectUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (!tokenUtils.canSee(token, workflow.token!)) return;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const validWeapons = getValidWeapons(token, workflow.token!, true);
  if (!validWeapons.length) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    'Your Quarry attempts to use a magical or supernatural ability. Use your reaction to attack your Quarry with a weapon?',
    { userId },
  );
  if (!selection) return;
  let selectedWeapon: Item<'weapon'> | undefined;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon = (await dialogUtils.selectDocumentDialog(
      `${feat.name}: Select Weapon`,
      'Select a weapon to use',
      validWeapons,
      {
        userId,
      },
    )) as Item<'weapon'> | undefined;
    if (!selectedWeapon) return;
  }
  const attackWorkflow: Workflow = await workflowUtils.syntheticItemRoll(
    selectedWeapon,
    [workflow.token!],
    {
      consumeResources: true,
      userId,
    },
  );
  if (!attackWorkflow.hitTargets.size) return;
  const endQuarry = await dialogUtils.confirm(
    feat.name,
    'You hit your Quarry. End the effect to force them to fail?',
    { userId },
  );
  if (endQuarry) {
    workflow.aborted = true;
    const effects = effectUtils.getAllEffectsByIdentifier(
      workflow.actor,
      'ac55eRangersQuarryTarget',
    ) as ActiveEffect[];
    const sourceEffect = effectUtils.getEffectByIdentifier(
      feat.actor!,
      'ac55eRangersQuarrySource',
    );
    if (!sourceEffect || !effects.length) return;
    const effect = effects.filter((e) => e.origin === sourceEffect.uuid)[0];
    return await effect.delete();
  }
  const saveWorkflow = await runActivity(feat, 'save', [workflow.token!]);
  if (!saveWorkflow || !saveWorkflow.failedSaves.size) return;
  workflow.aborted = true;
};

const macro: CPRMacro = {
  identifier: 'ac55eRuthlessCounter',
  name: 'Monster Slayer: Ruthless Counter',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'scenePreambleComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
};

export default macro;
