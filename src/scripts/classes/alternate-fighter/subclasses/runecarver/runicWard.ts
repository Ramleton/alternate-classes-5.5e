import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { isRuneInvokable, postRune } from './runes/runeUtils.js';

interface RunicWardReq {
  useItem: boolean;
  useRune?: Item<'feat'>;
}

export const pre = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<RunicWardReq> => {
  const {
    utils: { actorUtils, tokenUtils },
  } = chrisPremades;
  if (!feat.actor) return { useItem: false };
  const target = workflow.hitTargets.first() as Token;
  if (workflow.attackTotal < target.actor!.system.attributes.ac.value)
    return { useItem: false };
  if (!tokenUtils.canSee(workflow.token!, workflow.targets.first()! as Token))
    return { useItem: false };
  if (actorUtils.hasUsedReaction(feat.actor)) return { useItem: false };
  const {
    utils: { dialogUtils },
  } = chrisPremades;
  if (!feat.system.uses?.value) {
    const {
      utils: { itemUtils },
    } = chrisPremades;
    const runeIdentifiers = [
      'ac55eCloudRune',
      'ac55eFireRune',
      'ac55eFrostRune',
      'ac55eHillRune',
      'ac55eStoneRune',
      'ac55eStormRune',
    ];
    const usableRunes: Item<'feat'>[] = [];
    for (const identifier of runeIdentifiers) {
      const rune = itemUtils.getItemByIdentifier(feat.actor!, identifier) as
        Item<'feat'> | undefined;
      if (rune && isRuneInvokable(rune).usable) usableRunes.push(rune);
    }
    const rune = (await dialogUtils.selectDocumentDialog(
      feat.name,
      'A creature was attacked within range of your Runic Ward, but you are out of uses. Invoke a rune to ward the target?',
      usableRunes,
    )) as Item<'feat'> | undefined;
    return { useItem: false, useRune: rune };
  }
  const res = await dialogUtils.confirm(
    feat.name,

    'A creature was attacked within range of your Runic Ward. Ward the target of the attack?',
  );
  return { useItem: res };
};

const during = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<number> => {
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return 0;
  const target = workflow.hitTargets.first()! as Token;
  const acBonus = feat.actor!.system.abilities.con.mod;
  const targetAC = target.actor!.system.attributes.ac.value + acBonus;

  const successMessage = `<strong>${feat.name}</strong> — AC increased to <strong>${targetAC}</strong> (from ${feat.actor!.system.attributes.ac.value}) — Attack misses (${workflow.attackTotal} vs ${targetAC})`;

  const failureMessage = `<strong>${feat.name}</strong> — Attack still hits (${workflow.attackTotal} vs ${targetAC})`;

  if (workflow.attackTotal < targetAC) workflow.aborted = true;
  await ChatMessage.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    speaker: ChatMessage.getSpeaker({ actor: feat.actor as any }),
    content: workflow.attackTotal < targetAC ? successMessage : failureMessage,
  });
  return 1;
};

const post = async (feat: Item<'feat'>, rune?: Item<'feat'>): Promise<void> => {
  const {
    utils: { actorUtils, genericUtils },
  } = chrisPremades;
  await actorUtils.setReactionUsed(feat.actor!);
  if (!rune)
    return await genericUtils.update(feat, {
      'system.uses.spent': feat.system.uses!.spent + 1,
    });
  await postRune(rune);
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}): Promise<void> => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, workflow);
  if (!res1.useItem && !res1.useRune) return;
  const res2 = await during(feat, workflow);
  if (!res2) return;
  await post(feat, res1.useRune);
};

const macro: CPRMacro = {
  identifier: 'ac55eRunicWard',
  name: 'Runecarver: Runic Ward',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'sceneAttackRollComplete',
        macro: workflow,
        priority: 100,
        disposition: 'ally',
        distance: 30,
      },
    ],
  },
};

export default macro;
