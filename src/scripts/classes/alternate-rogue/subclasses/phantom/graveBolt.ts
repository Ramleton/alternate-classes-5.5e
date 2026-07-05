import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';
import { getWorkflowProperty } from 'automation/workflowUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const forceSave: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  const target = workflow.hitTargets.first()! as Token;
  const {
    utils: {
      constants,
      dialogUtils,
      genericUtils,
      itemUtils,
      socketUtils,
      templateUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.attacks.some((type) => type === actionType)) return;
  if (!getWorkflowProperty(workflow, feat.actor!, 'sneakAttack')) return;
  const nearbyTokens = tokenUtils
    .findNearby(token, 30, 'any', {
      includeIncapacitated: true,
      includeToken: false,
    })
    .filter((t) => t.id !== target.id);
  if (!nearbyTokens.length) return;
  let useDeathKnell = false;
  let message = 'Force a creature within 30 feet to save?';
  const deathKnell = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eDeathKnell',
  ) as Item<'feat'> | undefined;
  const soulTrinkets = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eSoulTrinkets',
  ) as Item<'feat'> | undefined;
  if (soulTrinkets && deathKnell) {
    useDeathKnell = await dialogUtils.confirm(
      'Death Knell',
      'Use Death Knell?',
      { userId: socketUtils.firstOwner(feat.actor, true) },
    );
    if (useDeathKnell)
      message = 'Use Death Knell on which creature within 30 feet?';
  }
  const selectedToken = await dialogUtils.selectTargetDialog(
    feat.name,
    message,
    nearbyTokens,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  if (!selectedToken || !selectedToken[0]) return;
  const targetToken = selectedToken[0] as Token;
  let saveWorkflow: Workflow | null = null;
  if (useDeathKnell) {
    const templateData = {
      user: game.user,
      t: 'circle' as const,
      distance: 30,
      direction: 0,
      angle: 0,
      width: 0,
      x: targetToken.x + targetToken.w / 2,
      y: targetToken.y + targetToken.h / 2,
      fillColor: game.user!.color,
      flags: {
        dnd5e: {
          origin: workflow.activity.uuid,
        },
      },
    };
    const [template] = await canvas!.scene!.createEmbeddedDocuments(
      'MeasuredTemplate',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [templateData as any],
    );
    await genericUtils.sleep(100);
    const tokens = templateUtils.getTokensInTemplate(template);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workflowUtils.addEntityRemoval(workflow, [template as any]);
    saveWorkflow = await runActivity(deathKnell!, 'save', Array.from(tokens));
    await genericUtils.update(soulTrinkets!, {
      'system.uses.spent': soulTrinkets!.system.uses!.spent + 1,
    });
  } else {
    saveWorkflow = await runActivity(feat, 'save', [targetToken]);
  }
  if (!saveWorkflow || !saveWorkflow?.failedSaves.size) return;
  if (!soulTrinkets || !soulTrinkets.system.uses!.value) return;
  const darkOffering = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eDarkOffering',
  ) as Item<'feat'> | undefined;
  if (!darkOffering || useDeathKnell) return;
  const selection = await dialogUtils.confirm(
    feat.name,
    `Use a Soul Trinket to frighten ${target.name}?`,
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return;
  await runActivity(darkOffering, 'otherworldlyFright', [targetToken]);
  await genericUtils.update(soulTrinkets!, {
    'system.uses.spent': soulTrinkets!.system.uses!.spent + 1,
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eGraveBolt',
  name: 'Phantom: Grave Bolt',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: forceSave,
        priority: 100,
      },
    ],
  },
};

export default macro;
