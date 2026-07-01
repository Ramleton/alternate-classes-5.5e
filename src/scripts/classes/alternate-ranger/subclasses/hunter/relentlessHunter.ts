import { getSpellData } from 'automation/spellUtils.js';
import CPRMacro, {
  MidiActiveEffect,
  MidiMacroFunction,
} from 'chris-premades/macro.js';

const checkDead: MidiMacroFunction = async ({ trigger: { entity }, ditem }) => {
  const effect = entity as MidiActiveEffect;
  const actor = effect.parent as Actor5e;
  if (!ditem) return;
  if (ditem.newHP > 0) return;
  if (actor.type !== 'npc') return;
  const sourceEffect = await fromUuid(effect.origin);
  const sourceActor = sourceEffect!.parent as Actor5e;
  const {
    utils: {
      actorUtils,
      dialogUtils,
      itemUtils,
      socketUtils,
      tokenUtils,
      workflowUtils,
    },
  } = chrisPremades;
  const rangersQuarry = itemUtils.getItemByIdentifier(
    sourceActor,
    'ac55eRangersQuarry',
  ) as Item<'feat'> | undefined;
  if (!rangersQuarry) return;
  if (!rangersQuarry.system.uses?.value) {
    const spellDetails = getSpellData(sourceActor);
    if (!spellDetails.hasSpellSlots) return;
  }
  const sourceToken = actorUtils.getFirstToken(sourceActor);
  const validTokens = tokenUtils
    .findNearby(sourceToken, 300, 'any', {
      includeIncapacitated: true,
      includeToken: false,
    })
    .filter((t) => tokenUtils.canSee(sourceToken, t));
  const userId = socketUtils.firstOwner(sourceActor, true);
  const selection = await dialogUtils.selectTargetDialog(
    'Relentless Hunter',
    'Your previous quarry has died. Select a new quarry?',
    validTokens,
    {
      userId,
      skipDeadAndUnconscious: false,
    },
  );
  if (!selection || !selection[0]) return;
  const target = selection[0];
  await workflowUtils.syntheticItemRoll(rangersQuarry, [target], {
    userId,
    consumeResources: true,
  });
  await actorUtils.removeReactionUsed(sourceActor);
};

const macro: CPRMacro = {
  identifier: 'ac55eRelentlessHunterApply',
  name: 'Hunter: Relentless Hunter',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'targetApplyDamage',
        macro: checkDead,
        priority: 991,
      },
    ],
  },
};

export default macro;
