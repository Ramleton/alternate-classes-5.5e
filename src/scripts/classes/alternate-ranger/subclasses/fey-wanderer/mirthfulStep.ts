import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (workflow.item.name !== 'Misty Step') return;
  const {
    utils: { dialogUtils, genericUtils, tokenUtils },
  } = chrisPremades;
  const nearbyTargets = tokenUtils
    .findNearby(token, 5, 'ally')
    .filter((t) => tokenUtils.canSee(token!, t));
  if (nearbyTargets?.length) {
    const selection = await dialogUtils.selectTargetDialog(
      workflow.item.name,
      'Casting Misty Step. Do you want to teleport a willing ally?',
      nearbyTargets,
    );
    if (!selection) return;
    const secondaryTarget = selection[0];
    await genericUtils.setFlag(
      entity,
      'alternate-classes-55e',
      'mirthfulStep',
      secondaryTarget.document.uuid,
    );
  }
};

const teleportAnother: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (workflow.item.name !== 'Misty Step') return;
  if (!entity.flags['alternate-classes-55e']?.mirthfulStep) return;
  const targetDocument = (await fromUuid(
    entity.flags['alternate-classes-55e']?.mirthfulStep,
  )) as TokenDocument;
  const {
    Teleport,
    utils: { actorUtils, genericUtils },
  } = chrisPremades;
  const target = actorUtils.getFirstToken(targetDocument.actor!);
  await Teleport.target([target], token!, {
    range: 5,
  });
  await genericUtils.unsetFlag(entity, 'alternate-classes-55e', 'mirthfulStep');
};

const macro: CPRMacro = {
  identifier: 'ac55eMirthfulStep',
  name: 'Fey Wanderer: Mirthful Step',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'preambleComplete',
        macro: prompt,
        priority: 100,
      },
      {
        pass: 'rollFinished',
        macro: teleportAnother,
        priority: 100,
      },
    ],
  },
};

export default macro;
