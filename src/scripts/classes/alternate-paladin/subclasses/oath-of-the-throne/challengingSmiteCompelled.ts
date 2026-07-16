import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';

const combatEnd: MacroFunction = async ({ trigger: { entity: effect } }) => {
  const {
    utils: { combatUtils },
  } = chrisPremades;
  await combatUtils.setTurnCheck(effect, 'compelledDuel', true);
};

const targetAttack: MidiMacroFunction = async ({
  trigger: { entity: effect },
  workflow,
}) => {
  const {
    utils: { effectUtils, workflowUtils },
  } = chrisPremades;
  if (workflow.targets.size !== 1) return;
  if (!workflowUtils.isAttackType(workflow, 'attack')) return;
  const origin = await effectUtils.getOriginItem(effect);
  if (!origin) return;
  const targetUuid = (workflow.targets.first()! as Token).document.uuid;
  const sourceUuid = effect.flags['chris-premades']?.compelledDuel?.sourceUuid;
  if (targetUuid === sourceUuid || !sourceUuid) return;
  workflow.tracker.disadvantage.add(origin.name, origin.name);
};

const targetAttacked: MidiMacroFunction = async ({
  trigger: { entity: effect, token: targetToken },
  workflow,
}) => {
  if (targetToken.document.disposition === workflow.token!.document.disposition)
    return;
  const sourceUuid = effect.flags['chris-premades']?.compelledDuel?.sourceUuid;
  if (workflow.token!.document.uuid === sourceUuid || !sourceUuid) return;
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.remove(effect);
};

const targetMoved: MacroFunction = async ({
  trigger: { entity: effect, token },
  options,
}) => {
  if (token.scene.id !== canvas!.scene!.id) return;
  const sourceToken = await fromUuid(
    effect.flags['chris-premades']?.compelledDuel?.sourceUuid,
  );
  if (!sourceToken) return;
  const {
    utils: { dialogUtils, genericUtils, socketUtils, tokenUtils },
  } = chrisPremades;
  const movementOrigin = genericUtils.duplicate(
    options?._movement?.[token.id!]?.origin,
  );
  const tempToken = (await token.actor!.getTokenDocument(
    {
      x: movementOrigin?.x ?? token.x,
      y: movementOrigin?.y ?? token.y,
      elevation:
        movementOrigin?.elevation ??
        (token as Token & { elevation: number }).elevation,
      actorLink: false,
      hidden: true,
      delta: { ownership: token.actor!.ownership },
    },
    { parent: canvas!.scene },
  )) as unknown as Token;
  const oldDistance = tokenUtils.getDistance(sourceToken, tempToken);
  const distance = tokenUtils.getDistance(sourceToken, token);
  if (oldDistance >= distance || distance <= 30) return;
  const selection = await dialogUtils.confirm(
    effect.name,
    'CHRISPREMADES.Macros.BoomingBlade.WillingMove',
    { userId: socketUtils.gmID() },
  );
  if (!selection) return;
};

const challengingSmiteCompelled: CPRMacro = {
  identifier: 'ac55eChallengingSmiteCompelled',
  name: 'Challenging Smite: Compelled',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'preAttackRollConfig',
        macro: targetAttack,
        priority: 50,
      },
      {
        pass: 'targetApplyDamage',
        macro: targetAttacked,
        priority: 50,
      },
    ],
  },
  combat: [
    {
      pass: 'combatEnd',
      macro: combatEnd,
      priority: 50,
    },
  ],
  movement: [
    {
      pass: 'moved',
      macro: targetMoved,
      priority: 50,
    },
  ],
};

export default challengingSmiteCompelled;
