import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { CharacterDetails } from 'fvtt-types/ConfiguredActor.js';
import { EffectData } from 'types/effects.js';

const UNCANNY_DODGE_TELEPORT_DISTANCE_MULTIPLIER = 0.5;

const prompt: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  const {
    Teleport,
    utils: {
      actorUtils,
      dialogUtils,
      effectUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(feat.actor!)) return;
  if (!tokenUtils.canSee(token, workflow.token!)) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;
  const effectData: EffectData = {
    name: feat.name,
    icon: feat.img,
    duration: { seconds: 1 },
    origin: feat.uuid!,
    flags: { dae: { stackable: 'noneName' } },
    changes: [
      {
        key: 'flags.automated-conditions-5e.grants.damage.modifier',
        mode: 0,
        value: 'modifier=/2',
        priority: 20,
      },
    ],
    statuses: [],
  };
  const effect = await effectUtils.createEffect(feat.actor!, effectData);
  await workflowUtils.addEntityRemoval(workflow, [effect]);
  await actorUtils.setReactionUsed(feat.actor!);
  if ((feat.actor!.system.details as CharacterDetails).level < 14) return;
  const speed = feat.actor!.system.attributes.movement.speed;
  await Teleport.target([token], token, {
    range: Math.floor(speed * UNCANNY_DODGE_TELEPORT_DISTANCE_MULTIPLIER),
  });
};

const macro: CPRMacro = {
  identifier: 'ac55eUncannyDodge',
  name: 'Uncanny Dodge',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetAttackRollComplete',
        macro: prompt,
        priority: 100,
      },
    ],
  },
};

export default macro;
