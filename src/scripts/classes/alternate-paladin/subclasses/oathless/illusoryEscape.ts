import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAuraRadius, getDivineFervorUses } from '../../utils/utils.js';

const pre = async (
  feat: Item<'feat'>,
  token: Token,
  workflow: Workflow,
): Promise<boolean> => {
  const divineFervorUses = getDivineFervorUses(feat.actor!);
  if (divineFervorUses < 2)
    return false;
  const { utils: {
    actorUtils,
    dialogUtils,
    socketUtils,
    tokenUtils,
  } } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor!))
    return false;
  const sourceToken = workflow.token;
  if (!tokenUtils.canSee(token, sourceToken!))
    return false;
  const selection = dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor!, true),
  });
  return selection;
};

const handleAuraOfDeception = async (
  feat: Item<'feat'>,
  token: Token,
  workflow: Workflow,
): Promise<void> => {
  const { utils: {
    dialogUtils,
    socketUtils,
    tokenUtils,
    workflowUtils,
  } } = chrisPremades;
  const auraRadius = getAuraRadius(feat.actor!);
  const nearbyTokens = tokenUtils.findNearby(token, auraRadius, 'any', {
    includeIncapacitated: true,
  });
  if (!nearbyTokens.length)
    return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor!, true),
  });
  if (!selection)
    return;
  const target = await dialogUtils.selectTargetDialog(
    'Oathless: Aura of Deception',
    'Select a token to replace you as a target',
    nearbyTokens,
  );
  if (!target)
    return;
  await workflowUtils.removeTargets(workflow, [token]);
  const newTargets = Array.from(new Set([...workflow.targets, target[0]]));
  await workflowUtils.updateTargets(
    workflow,
    newTargets,
  );
};

const during = async (
  feat: Item<'feat'>,
  token: Token,
  workflow: Workflow,
): Promise<void> => {
  const { utils: {
    itemUtils,
  } } = chrisPremades;
  const auraOfDeception = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eAuraOfDeception',
  ) as Item<'feat'> | undefined;
  if (auraOfDeception)
    await handleAuraOfDeception(auraOfDeception, token, workflow);
  await runActivity(feat, 'use', [token]);
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, token, workflow);
  if (!res1) return;
  await during(feat, token, workflow);
};

export const illusoryEscape: CPRMacro = {
  identifier: 'ac55eIllusoryEscape',
  name: 'Oathless: Illusory Escape',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [{
      pass: 'targetDamageRollComplete',
      macro: workflow,
      priority: 910,
    }],
  },
};
