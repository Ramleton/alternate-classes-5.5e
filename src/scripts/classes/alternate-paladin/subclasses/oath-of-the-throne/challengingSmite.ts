import CPRMacro, { MacroFunction, MidiMacroFunction } from 'chris-premades/macro.js';
import subclassSmiteMacroFactory, { DuringSmiteCallback } from '../utils/subclassSmiteFactory.js';

const during: DuringSmiteCallback = async ({ feat, workflow }) => {
  const { utils: { effectUtils } } = chrisPremades;
  const casterEffectData = {
    name: 'Challenging Smite: Source',
    img: feat.img!,
    origin: feat.uuid!,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        compelledDuel: {
          targetUuids: Array
            .from(workflow.targets)
            .map(target => (target as Token).document.uuid),
        },
      },
    },
  };
  const effect = await effectUtils.createEffect(
    workflow.actor,
    casterEffectData,
  );
  const targetEffectData = {
    name: 'Challenging Smite: Target',
    img: feat.img!,
    origin: feat.uuid!,
    duration: casterEffectData.duration,
    flags: {
      'chris-premades': {
        compelledDuel: {
          sourceUuid: workflow.token?.document.uuid,
        },
      },
    },
  };
  for (const target of workflow.hitTargets) {
    await effectUtils.createEffect(target.actor!, targetEffectData, {
      parentEntity: effect,
      strictlyInterdependent: true,
      identifier: 'compelledDuelTarget',
      rules: 'modern',
      macros: [
        { type: 'midi.actor', macros: ['compelledDuelCompelled'] },
        { type: 'combat', macros: ['compelledDuelCompelled'] },
        { type: 'midi.item', macros: ['compelledDuelCompelled'] },
      ],
    });
  }
};

export const challengingSmite = await subclassSmiteMacroFactory({
  name: 'Challenging Smite',
  subclass: 'Oath of the Throne',
  duringCallback: during,
});

const combatEnd: MacroFunction = async ({ trigger: { entity: effect } }) => {
  const { utils: { combatUtils } } = chrisPremades;
  await combatUtils.setTurnCheck(effect, 'compelledDuel', true);
};

const turnEnd: MacroFunction = async ({
  trigger: { entity: effect, token: sourceToken },
}) => {
  const targetUuids = effect
    .flags
    ?.['chris-premades']
    ?.compelledDuel
    ?.targetUuids;
  if (!targetUuids)
    return;
  const { utils: {
    dialogUtils,
    effectUtils,
    genericUtils,
    socketUtils,
    tokenUtils,
  } } = chrisPremades;
  for (const targetUuid of targetUuids) {
    const targetToken = fromUuidSync(targetUuid);
    if (!targetToken || !sourceToken)
      continue;
    const distance = tokenUtils.getDistance(sourceToken, targetToken);
    if (distance <= 30)
      continue;
    const selection = await dialogUtils.confirm(
      (await effectUtils.getOriginItem(effect))?.name,
      'CHRISPREMADES.Macros.CompelledDuel.EndEffect',
      { userId: socketUtils.gmID() },
    );
    if (!selection)
      continue;
    await genericUtils.remove(effect);
  }
};

const targetAttack: MidiMacroFunction = async ({
  trigger: { entity: effect }, workflow,
}) => {
  const { utils: { effectUtils, workflowUtils } } = chrisPremades;
  if (workflow.targets.size !== 1)
    return;
  if (!workflowUtils.isAttackType(workflow, 'attack'))
    return;
  const origin = await effectUtils.getOriginItem(effect);
  if (!origin)
    return;
  const targetUuid = (workflow.targets.first()! as Token).document.uuid;
  const sourceUuid = effect.flags['chris-premades']?.compelledDuel?.sourceUuid;
  if (targetUuid === sourceUuid || !sourceUuid)
    return;
  workflow.tracker.disadvantage.add(origin.name, origin.name);
};

const sourceAttack: MidiMacroFunction = async ({
  trigger: { entity: effect }, workflow,
}) => {
  if (!workflow.targets.size)
    return;
  const { utils: { genericUtils, workflowUtils } } = chrisPremades;
  const targetUuids = effect
    .flags
    ['chris-premades']
    ?.compelledDuel
    ?.targetUuids;
  if (!targetUuids)
    return;
  let endSpell = false;
  for (const target of workflow.targets) {
    if (workflowUtils.isAttackType(workflow, 'attack')) {
      if (!targetUuids.includes((target as Token).document.uuid))
        endSpell = true;
    }
    else {
      const disposition = (target as Token).document.disposition;
      if (
        disposition !== workflow.token!.document.disposition
        && !targetUuids.includes((target as Token).document.uuid))
        endSpell = true;
    }
  }
  if (!endSpell)
    return;
  await genericUtils.remove(effect);
};

const targetAttacked: MidiMacroFunction = async ({
  trigger: { entity: effect, token: targetToken }, workflow,
}) => {
  if (targetToken.document.disposition === workflow.token!.document.disposition)
    return;
  const sourceUuid = effect.flags['chris-premades']?.compelledDuel?.sourceUuid;
  if (workflow.token!.document.uuid === sourceUuid || !sourceUuid)
    return;
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.remove(effect);
};

const targetMoved: MacroFunction = async ({
  trigger: { entity: effect, token }, options,
}) => {
  if (token.scene.id !== canvas!.scene!.id)
    return;
  const sourceToken = await fromUuid(
    effect.flags['chris-premades']?.compelledDuel?.sourceUuid,
  );
  if (!sourceToken)
    return;
  const { utils: {
    dialogUtils,
    genericUtils,
    socketUtils,
    tokenUtils,
  } } = chrisPremades;
  const movementOrigin = genericUtils.duplicate(
    options?._movement?.[token.id]?.origin,
  );
  const tempToken = await token.actor!.getTokenDocument({
    x: movementOrigin?.x ?? token.x,
    y: movementOrigin?.y ?? token.y,
    elevation: movementOrigin?.elevation
      ?? (token as Token & { elevation: number }).elevation,
    actorLink: false,
    hidden: true,
    delta: { ownership: token.actor!.ownership },
  }, { parent: canvas!.scene }) as unknown as Token;
  const oldDistance = tokenUtils.getDistance(sourceToken, tempToken);
  const distance = tokenUtils.getDistance(sourceToken, token);
  if (oldDistance >= distance || distance <= 30)
    return;
  const selection = await dialogUtils.confirm(
    effect.name,
    'CHRISPREMADES.Macros.BoomingBlade.WillingMove',
    { userId: socketUtils.gmID() },
  );
  if (!selection)
    return;
};

export const challengingSmiteCompelled: CPRMacro = {
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
  combat: [{
    pass: 'combatEnd',
    macro: combatEnd,
    priority: 50,
  }],
  movement: [
    {
      pass: 'moved',
      macro: targetMoved,
      priority: 50,
    },
  ],
};

export const challengingSmiteSource: CPRMacro = {
  identifier: 'ac55eChallengingSmiteSource',
  name: 'Challenging Smite: Source',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [{
      pass: 'postAttackRoll',
      macro: sourceAttack,
      priority: 50,
    }],
  },
  combat: [{
    pass: 'turnEnd',
    macro: turnEnd,
    priority: 50,
  }],
};
