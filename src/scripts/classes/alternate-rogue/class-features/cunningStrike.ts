import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const CUNNING_STRIKE_PAR_DEVIOUS_EXPLOIT_IDENTIFIERS = [
  'ac55ePrecisionStrikeExploit',
] as const;

const CUNNING_STRIKE_ARC_DEVIOUS_EXPLOIT_IDENTIFIERS = [
  'ac55eArrestingStrikeExploit',
  'ac55eDisarmExploit',
  'ac55eSweepingStrikeExploit',
  'ac55eCripplingStrikeExploit',
  'ac55eDirtyHitExploit',
  'ac55eExposingStrike',
] as const;

const pre = (feat: Item<'feat'>): boolean => {
  if (!feat.actor) return false;
  const altClasses55eFlags = feat.actor.flags['alternate-classes-55e'];
  if (!altClasses55eFlags?.macros?.['sneak-attack']) return false;
  if (altClasses55eFlags?.macros?.exploit?.used) return false;
  return true;
};

const promptEarly: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!pre(feat)) return;
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const ownedDeviousExploits =
    CUNNING_STRIKE_PAR_DEVIOUS_EXPLOIT_IDENTIFIERS.map((i) =>
      itemUtils.getItemByIdentifier(feat.actor!, i),
    )
      .filter(Boolean)
      .map((i) => i as Item<'feat'>)
      .filter((i) => i.system.type.subtype === 'deviousExploit');
  if (!ownedDeviousExploits.length) return;

  // Using Cunning Strike means using Sneak Attack by default
  await post(feat);
};

const prompt: MidiMacroFunction = async ({ trigger: { entity } }) => {
  const feat = entity as Item<'feat'>;
  if (!pre(feat)) return;
  const {
    utils: { dialogUtils, itemUtils, socketUtils },
  } = chrisPremades;
  const ownedDeviousExploits =
    CUNNING_STRIKE_ARC_DEVIOUS_EXPLOIT_IDENTIFIERS.map((i) =>
      itemUtils.getItemByIdentifier(feat.actor!, i),
    )
      .filter(Boolean)
      .map((i) => i as Item<'feat'>)
      .filter((i) => i.system.type.subtype === 'deviousExploit');
  if (!ownedDeviousExploits.length) return;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selection = await dialogUtils.confirmUseItem(feat, { userId });
  if (!selection) return;
  let selectedDeviousExploit: Item<'feat'>;
  if (ownedDeviousExploits.length === 1) {
    selectedDeviousExploit = ownedDeviousExploits[0];
  } else {
    const buttons: [string, Item<'feat'>][] = ownedDeviousExploits.map((i) => [
      i.name,
      i,
    ]);
    selectedDeviousExploit = await dialogUtils.buttonDialog(
      feat.name,
      'Select Devious Exploit',
      buttons,
      { userId },
    );
    if (!selectedDeviousExploit) return;
  }
  console.log(selectedDeviousExploit);
  // Using Cunning Strike means using Sneak Attack by default
  await post(feat);
};

const post = async (feat: Item<'feat'>) => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.sneak-attack',
    1,
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eCunningStrike',
  name: 'Cunning Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'postAttackRoll',
        macro: promptEarly,
        priority: 60,
      },
      {
        pass: 'attackRollComplete',
        macro: prompt,
        priority: 60,
      },
    ],
  },
};

export default macro;
