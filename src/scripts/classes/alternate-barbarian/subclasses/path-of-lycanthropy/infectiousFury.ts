import { getActivityData, runActivity } from 'automation/utils.js';
import { getMeleeWeaponsInRange } from 'automation/weaponUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { getExploitUsesRemaining } from 'exploits/utils/exploitUtils.js';
import { spendAlternateMartialExploitUses } from 'exploits/utils/spendExploitUtils.js';
import { DamageActivity } from 'fvtt-types/Activity.js';
import { isRaging } from '../../utils/rageUtils.js';

const psychicDamage = async (
  feat: Item<'feat'>,
  exploitDie: `d${number}`,
  target: Token,
) => {
  const damageActivity = (await getActivityData(feat, 'damage')) as
    DamageActivity | undefined;
  if (!damageActivity) return;
  const {
    utils: { workflowUtils },
  } = chrisPremades;
  damageActivity.damage.parts[0].custom.formula = `3${exploitDie}`;
  return await workflowUtils.syntheticActivityDataRoll(
    damageActivity,
    feat,
    feat.actor!,
    [target],
  );
};

const forceTargetAttack = async (
  feat: Item<'feat'>,
  target: Token,
  tokensInReach: Token[],
) => {
  const {
    utils: { dialogUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  const res = await dialogUtils.selectTargetDialog(
    feat.name,
    'Select a token to attack',
    tokensInReach,
    { userId: socketUtils.firstOwner(target.actor!, true) },
  );
  if (!res || !res[0]) return;
  const validWeapons = getMeleeWeaponsInRange(target, res[0]);
  if (!validWeapons.length) return;
  let selectedWeapon = validWeapons[0];
  if (validWeapons.length > 1) {
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      feat.name,
      'Select a weapon to use',
      validWeapons,
      { userId: socketUtils.firstOwner(target.actor!, true) },
    );
    if (!selectedWeapon) return;
  }
  await workflowUtils.syntheticItemDataRoll(selectedWeapon, target.actor!, [
    res[0],
  ]);
};

const handle: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return;
  if (workflow.item.system.type.value !== 'natural') return;
  const feat = entity as Item<'feat'>;
  const remainingUses = getExploitUsesRemaining(feat);
  if (!feat.system.uses?.value && !remainingUses) return;
  if (!isRaging(feat.actor!)) return;
  const target = workflow.hitTargets.first() as Token;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const {
    utils: { actorUtils, dialogUtils, genericUtils, socketUtils, tokenUtils },
  } = chrisPremades;
  const selection = await dialogUtils.confirm(
    feat.name,
    'Use Infectious Fury?',
    { userId: socketUtils.firstOwner(feat.actor!, true) },
  );
  if (!selection) return;
  if (feat.system.uses?.value) {
    await genericUtils.update(feat, {
      'system.uses.spent': feat.system.uses.spent + 1,
    });
  } else {
    await spendAlternateMartialExploitUses(feat, 1);
  }
  const saveWorkflow = await runActivity(feat, 'save', [target]);
  if (!saveWorkflow?.failedSaves?.size) return;
  const options: [string, string][] = [
    [`Psychic Damage (3${exploitDie})`, `psychic`],
  ];
  const maxReach = (
    target.actor!.items.filter((i) => i.type === 'weapon') as Item<'weapon'>[]
  )
    .filter((i) => i.system.equipped)
    .filter((i) => i.system.range.reach)
    .reduce((a, b) => Math.max(a, b.system.range.reach ?? 0), 0);
  const tokensInReach = tokenUtils
    .findNearby(target, maxReach, 'any', {
      includeIncapacitated: true,
      includeToken: false,
    })
    .filter((t) => t.id === token.id);
  const usedReaction = actorUtils.hasUsedReaction(target.actor!);
  if (!usedReaction && tokensInReach.length) {
    options.push(['Force a Melee Attack', `forcedAttack`]);
  }
  let selectedOption: string | undefined = undefined;
  if (options.length === 1) {
    selectedOption = options[0][1];
  } else {
    selectedOption = await dialogUtils.buttonDialog(
      feat.name,
      'Select an option',
      options,
      {
        userId: socketUtils.firstOwner(feat.actor!, true),
      },
    );
    if (!selection) return;
  }
  if (selectedOption === 'psychic')
    return await psychicDamage(feat, exploitDie, target);
  await forceTargetAttack(feat, target, tokensInReach);
};

const macro: CPRMacro = {
  identifier: 'ac55eInfectiousFury',
  name: 'Path of Lycanthropy: Infectious Fury',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 200,
      },
    ],
  },
};

export default macro;
