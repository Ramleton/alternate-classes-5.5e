import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';

const sourceAttack: MidiMacroFunction = async ({
  trigger: { entity: effect },
  workflow,
}) => {
  if (!workflow.targets.size) return;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  const targetUuids =
    effect.flags['chris-premades']?.compelledDuel?.targetUuids;
  if (!targetUuids) return;
  let endSpell = false;
  for (const target of workflow.targets) {
    if (workflowUtils.isAttackType(workflow, 'attack')) {
      if (!targetUuids.includes((target as Token).document.uuid))
        endSpell = true;
    } else {
      const disposition = (target as Token).document.disposition;
      if (
        disposition !== workflow.token!.document.disposition &&
        !targetUuids.includes((target as Token).document.uuid)
      )
        endSpell = true;
    }
  }
  if (!endSpell) return;
  await genericUtils.remove(effect);
};

const turnEnd: MacroFunction = async ({
  trigger: { entity: effect, token: sourceToken },
}) => {
  const targetUuids =
    effect.flags?.['chris-premades']?.compelledDuel?.targetUuids;
  if (!targetUuids) return;
  const {
    utils: { dialogUtils, effectUtils, genericUtils, socketUtils, tokenUtils },
  } = chrisPremades;
  for (const targetUuid of targetUuids) {
    const targetToken = fromUuidSync(targetUuid);
    if (!targetToken || !sourceToken) continue;
    const distance = tokenUtils.getDistance(sourceToken, targetToken);
    if (distance <= 30) continue;
    const selection = await dialogUtils.confirm(
      (await effectUtils.getOriginItem(effect))?.name,
      'CHRISPREMADES.Macros.CompelledDuel.EndEffect',
      { userId: socketUtils.gmID() },
    );
    if (!selection) continue;
    await genericUtils.remove(effect);
  }
};

const challengingSmiteSource: CPRMacro = {
  identifier: 'ac55eChallengingSmiteSource',
  name: 'Challenging Smite: Source',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: sourceAttack,
        priority: 50,
      },
    ],
  },
  combat: [
    {
      pass: 'turnEnd',
      macro: turnEnd,
      priority: 50,
    },
  ],
};

export default challengingSmiteSource;
