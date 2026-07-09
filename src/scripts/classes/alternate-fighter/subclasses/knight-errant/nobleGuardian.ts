import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import {
  getExploitUsesRemaining,
  spendExploitUses,
} from 'exploits/utils/exploitUtils.js';
import { EffectData } from '../../../../../types/effects.js';

interface PreNobleGuardian {
  use: boolean;
  spendReaction: boolean;
}

const pre = async (
  token: Token,
  sourceToken: Token,
  targetToken: Token,
  workflow: Workflow,
): Promise<PreNobleGuardian> => {
  // Don't prompt if the attacker is the user
  if (token.id === sourceToken.id) return { use: false, spendReaction: false };
  if (!token.actor) return { use: false, spendReaction: false };
  if (!targetToken.actor) return { use: false, spendReaction: false };
  // Don't prompt if the target's AC is higher than the attack
  if (targetToken.actor.system.attributes.ac.value > workflow.attackTotal)
    return { use: false, spendReaction: false };
  const {
    utils: { actorUtils, dialogUtils, itemUtils },
  } = chrisPremades;
  const validEquipment = (
    token.actor.items.filter((i) => i.system.equipped) as Item<'equipment'>[]
  ).filter((i) =>
    ['simpleM', 'martialM', 'shield'].includes(i.system.type.value),
  );
  if (!validEquipment.length) return { use: false, spendReaction: false };
  const usedReaction = actorUtils.hasUsedReaction(token.actor);
  const legendaryKnightErrant = itemUtils.getItemByIdentifier(
    token.actor,
    'ac55eLegendaryKnightErrant',
  ) as Item<'feat'>;
  const legendaryKnightErrantUses = legendaryKnightErrant?.system?.uses?.value;
  if (usedReaction && !legendaryKnightErrantUses)
    return { use: false, spendReaction: false };
  const selection = await dialogUtils.confirm(
    'Noble Guardian',
    'A creature is hit by an attack, do you want to use Noble Guardian?',
  );
  if (!selection) return { use: false, spendReaction: false };
  return { use: true, spendReaction: !usedReaction };
};
const during = async (
  feat: Item<'feat'>,
  target: Token,
  workflow: Workflow,
) => {
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return false;
  const {
    utils: { genericUtils, rollUtils },
  } = chrisPremades;
  const res = await rollUtils.rollDice(`1d${exploitDie}`, {
    chatMessage: true,
  });
  await genericUtils.sleep(1500);
  const acBonus = res.roll.total;
  const targetAC = target.actor!.system.attributes.ac.value + acBonus;

  const successMessage = `<strong>${feat.name}</strong> — AC increased to <strong>${targetAC}</strong> (from ${feat.actor!.system.attributes.ac.value}) — Attack misses (${workflow.attackTotal} vs ${targetAC})`;

  const failureMessage = `<strong>${feat.name}</strong> — Attack still hits (${workflow.attackTotal} vs ${targetAC})`;

  await ChatMessage.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    speaker: ChatMessage.getSpeaker({ actor: feat.actor as any }),
    content: workflow.attackTotal < targetAC ? successMessage : failureMessage,
  });
  if (workflow.attackTotal < targetAC) {
    workflow.aborted = true;
    return 1;
  }
  // In this case, the attack still hits, so we need to ask if the user wants to spend an exploit die to grant resistance to the damage
  if (!getExploitUsesRemaining(feat)) return 1;
  const {
    utils: { dialogUtils, effectUtils },
  } = chrisPremades;
  const selection = await dialogUtils.confirm(
    'Noble Guardian: Damage Resistance',

    `The attack still hits ${target.actor!.name}. Do you want to spend an exploit die to grant resistance to the damage?`,
  );
  if (!selection) return 1;
  await spendExploitUses(feat, 1);
  const effectData: EffectData = {
    name: 'Noble Guardian: Resistance',
    icon: feat.img!,
    duration: { seconds: 1 },
    origin: '',
    flags: {
      dae: {
        specialDuration: ['isDamaged'],
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eNobleGuardianEffect',
        },
      },
    },
    changes: [
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: 'ALL',
        priority: 20,
      },
    ],
    statuses: [],
  };
  await effectUtils.createEffect(target.actor!, effectData);
  return 1;
};
const post = async (token: Token, spendReaction: boolean) => {
  const {
    utils: { actorUtils, genericUtils, itemUtils },
  } = chrisPremades;
  if (spendReaction) {
    await actorUtils.setReactionUsed(token.actor!);
    return;
  }
  const legendaryKnightErrant = itemUtils.getItemByIdentifier(
    token.actor!,
    'ac55eLegendaryKnightErrant',
  ) as Item<'feat'>;
  if (!legendaryKnightErrant) return;
  await genericUtils.update(legendaryKnightErrant, {
    'system.uses.spent': legendaryKnightErrant.system.uses!.spent + 1,
  });
};
const workflow: MidiMacroFunction = async ({
  trigger: { entity: item, token, sourceToken },
  workflow,
}) => {
  const target = workflow.hitTargets.first()! as Token;
  if (!sourceToken) return false;
  if (!target) return false;
  const res1 = await pre(token, sourceToken, target, workflow);
  if (!res1.use) return;
  const feat = item as Item<'feat'>;
  const res2 = await during(feat, target, workflow);
  if (!res2) return;
  await post(token, res1.spendReaction);
};
const macro: CPRMacro = {
  identifier: 'ac55eNobleGuardian',
  name: 'Noble Guardian',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneAttackRollComplete',
        macro: workflow,
        priority: 250,
      },
    ],
  },
};

export default macro;
