import { getAltMartialExploitsRemaining, spendAlternateMartialExploitUses } from 'exploits/utils.js';

interface RuneInvokable {
  usable: boolean;
  reason: string;
}

export const isRuneInvokable = (
  feat: Item<'feat'>,
): RuneInvokable => {
  const { utils: { itemUtils } } = chrisPremades;
  const runeName = feat.flags?.['chris-premades']?.info?.identifier
    .slice(5)
    .slice(0, -4);
  const inscriptions = feat.actor!.items.filter(
    i => itemUtils.getEffectByIdentifier(i, `ac55e${runeName}RuneInscription`));
  if (inscriptions.length < 2) {
    return {
      usable: false,
      reason: 'You must have at least 2 rune inscriptions to invoke this rune',
    };
  }
  const actorFlags = feat.actor!.flags['alternate-classes-55e'];
  if (feat.system.uses?.spent) {
    const elderInsight = itemUtils.getItemByIdentifier(
      feat.actor!,
      'ac55eElderInsight',
    );
    if (!elderInsight) {
      return {
        usable: false,
        // eslint-disable-next-line @stylistic/max-len
        reason: 'You have invoked this rune already and must have Elder Insight to use it again.',
      };
    }
    if (actorFlags
      ?.macros
      ?.runeCarver
      ?.elderInsight
      ?.[runeName.toLowerCase()]
    ) {
      return {
        usable: false,
        reason: 'You have already invoked this rune using Elder Insight before',
      };
    }
    if (!getAltMartialExploitsRemaining(feat)) {
      return {
        usable: false,
        // eslint-disable-next-line @stylistic/max-len
        reason: 'You have already invoked this rune and are out of exploit dice',
      };
    }
  }
  return { usable: true, reason: '' };
};

export const preRune = async (
  feat: Item<'feat'>,
): Promise<boolean> => {
  const res = isRuneInvokable(feat);
  if (!res.usable) {
    const { utils: { genericUtils } } = chrisPremades;
    genericUtils.notify(res.reason, 'error');
    return false;
  }
  return true;
};

export const postRune = async (feat: Item<'feat'>) => {
  const { utils: { genericUtils, itemUtils } } = chrisPremades;
  if (feat.system.uses?.spent) {
    const elderInsight = itemUtils.getItemByIdentifier(
      feat.actor!,
      'ac55eElderInsight',
    );
    if (!elderInsight)
      return;
    const rune = feat.flags?.['chris-premades']?.info?.identifier
      .slice(5)
      .slice(0, -4)
      .toLowerCase();
    await genericUtils.setFlag(
      feat.actor!,
      'alternate-classes-55e',
      `macros.runeCarver.elderInsight.${rune}`,
      1,
    );
    await spendAlternateMartialExploitUses(1, feat);
  }
  else {
    await genericUtils.update(
      feat,
      { 'system.uses.spent': feat.system.uses!.spent + 1 },
    );
  }
};
