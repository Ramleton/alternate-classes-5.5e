import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { MidiQOLEvent } from 'chris-premades/macroEvents.js';

export interface PreCallbackArgs {
  feat: Item<'feat'>;
  token: Token;
  workflow: Workflow;
}

export type PreACBoostCallback = (data: PreCallbackArgs) => Promise<boolean>;

export const preACBoost: PreACBoostCallback = async ({
  feat,
  token,
  workflow,
}) => {
  if (!feat.actor) return false;
  if (!workflow.hitTargets.size) return false;
  const {
    utils: { actorUtils, dialogUtils, socketUtils, tokenUtils },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor)) return false;
  if (!tokenUtils.canSee(token, workflow.token!)) return false;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(feat.actor, true),
  });
  return selection;
};

export interface DuringCallbackArgs {
  feat: Item<'feat'>;
  token: Token;
  workflow: Workflow;
  acBoostCallback: ACBoostCallback;
}

/**
 * Returns true if the AC boost successfully beat the Attack Roll, and false
 * otherwise.
 */
export type DuringACBoostCallback = (
  data: DuringCallbackArgs,
) => Promise<boolean>;

export const duringACBoost: DuringACBoostCallback = async ({
  feat,
  workflow,
  acBoostCallback,
}) => {
  const target = workflow.hitTargets.first()! as Token;
  const targetAC =
    target.actor!.system.attributes.ac.value +
    (await acBoostCallback({ feat, workflow }));

  const successMessage = `<strong>${feat.name}</strong> — AC increased to <strong>${targetAC}</strong> (from ${feat.actor!.system.attributes.ac.value}) — Attack misses (${workflow.attackTotal} vs ${targetAC})`;

  let displayMessage = `<strong>${feat.name}</strong> — Attack still hits (${workflow.attackTotal} vs ${targetAC})`;
  if (workflow.attackTotal < targetAC) {
    workflow.aborted = true;
    displayMessage = successMessage;
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: feat.actor }),
    content: displayMessage,
  });
  return displayMessage === successMessage;
};

export interface PostCallbackArgs {
  feat: Item<'feat'>;
  workflow: Workflow;
}

export type PostCallback = (data: PostCallbackArgs) => Promise<void>;

export const postArmorClassBoost: PostCallback = async ({ feat }) => {
  const {
    utils: { actorUtils },
  } = chrisPremades;
  await actorUtils.setReactionUsed(feat.actor!);
};

export type ACBoostCallback = ({
  feat,
  workflow,
}: {
  feat: Item<'feat'>;
  workflow: Workflow;
}) => Promise<number>;

interface ACBoostMacroFactoryArgs {
  identifier?: string;
  name: string;
  version?: `${number}.${number}.${number}`;
  macroPass?: MidiQOLEvent;
  priority?: number;
  acBoostCallback: ACBoostCallback;
  preCallback?: PreACBoostCallback;
  duringCallback?: DuringACBoostCallback;
  postCallback?: PostCallback;
}

type ACBoostMacroFactory = (args: ACBoostMacroFactoryArgs) => CPRMacro;

const acBoostMacroFactory: ACBoostMacroFactory = ({
  name,
  identifier = 'ac55e' + name.replaceAll(' ', ''),
  version = '1.0.0',
  macroPass = 'sceneAttackRollComplete',
  priority = 910,
  acBoostCallback,
  preCallback = preACBoost,
  duringCallback = duringACBoost,
  postCallback = postArmorClassBoost,
}) => {
  const workflow: MidiMacroFunction = async ({
    trigger: { entity, token },
    workflow,
  }) => {
    const feat = entity as Item<'feat'>;
    const res1 = await preCallback({ feat, token, workflow });
    if (!res1) return;
    const res2 = await duringCallback({
      feat,
      token,
      workflow,
      acBoostCallback,
    });
    await postCallback({ feat, workflow });
    return res2;
  };
  return {
    identifier,
    name,
    source: 'Alternate Classes 5.5e',
    version,
    rules: 'modern',
    midi: {
      actor: [
        {
          pass: macroPass,
          macro: workflow,
          priority,
        },
      ],
    },
  };
};

export default acBoostMacroFactory;
