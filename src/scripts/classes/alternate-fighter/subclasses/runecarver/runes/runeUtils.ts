import { getAltMartialExploitsRemaining, spendAlternateMartialExploitUses } from 'exploits/utils.js';

export const preRune = async (
  feat: Item<'feat'>,
  rune: 'fire' | 'frost' | 'hill' | 'stone' | 'storm' | 'cloud',
): Promise<boolean> => {
  const { utils: { genericUtils, itemUtils } } = chrisPremades;
  const runeName = rune.charAt(0).toUpperCase() + rune.slice(1);
  const inscriptions = feat.actor!.items.filter(
    i => itemUtils.getEffectByIdentifier(i, `ac55e${runeName}RuneInscription`));
  if (inscriptions.length < 2) {
    genericUtils.notify(
      'You must have inscribed the rune into an item to use it',
      'error',
    );
    return false;
  }
  const actorFlags = feat.actor!.flags['alternate-classes-55e'];
  if (feat.system.uses?.spent) {
    const elderInsight = itemUtils.getItemByIdentifier(
      feat.actor!,
      'ac55eElderInsight',
    );
    if (!elderInsight) {
      genericUtils.notify(
        // eslint-disable-next-line @stylistic/max-len
        'You have invoked this rune already and must have Elder Insight to use it again.',
        'error',
      );
      return false;
    }
    if (actorFlags?.macros?.runeCarver?.elderInsight?.[rune]) {
      genericUtils.notify(
        'You have already invoked this rune using Elder Insight before',
        'error',
      );
      return false;
    }
    if (!getAltMartialExploitsRemaining(feat)) {
      genericUtils.notify(
        'You have already invoked this rune and are out of exploit dice',
        'error',
      );
      return false;
    }
  }
  return true;
};

export const postRune = async (
  feat: Item<'feat'>,
  rune: 'fire' | 'frost' | 'hill' | 'stone' | 'storm' | 'cloud',
) => {
  const { utils: { genericUtils, itemUtils } } = chrisPremades;
  if (feat.system.uses?.spent) {
    const elderInsight = itemUtils.getItemByIdentifier(
      feat.actor!,
      'ac55eElderInsight',
    );
    if (!elderInsight)
      return;
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
