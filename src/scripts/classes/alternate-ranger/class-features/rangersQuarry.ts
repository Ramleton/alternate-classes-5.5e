import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { applySourceTargetInterdependentEffects } from 'automation/effectUtils.js';
import {
  getSpellData,
  spendLowestLevelSpellSlot,
} from 'automation/spellUtils.js';
import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';
import { EffectChange, EffectDuration } from 'types/effects.js';
import { isQuarry } from '../utils/quarryUtils.js';

const preAutomatedApply: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!workflow.hitTargets.size) return;
  const {
    utils: { dialogUtils, itemUtils, socketUtils },
  } = chrisPremades;
  const target = workflow.hitTargets.first() as Token;
  // Slayer I knack required for automatic application on attack
  const slayerI = itemUtils.getItemByIdentifier(feat.actor, 'ac55eSlayerI');
  if (!slayerI) return;
  if (isQuarry(feat.actor!, target.actor!)) return;
  // If no item uses left, the actor can instead spend a spell slot
  if (!feat.system.uses?.value) {
    const spellDetails = getSpellData(feat.actor!);
    if (!spellDetails.hasSpellSlots) return;
  }
  const selection = await dialogUtils.confirm(
    feat.name,
    `Apply Ranger's Quarry to ${target.name}?`,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  if (!selection) return;
  await runActivity(feat, 'use', [target]);
};

interface PreSpendResult {
  canBeUsed: boolean;
  spendSpellSlot: boolean;
}

const pre = async (feat: Item<'feat'>): Promise<PreSpendResult> => {
  if (!feat.system.uses?.value) {
    const spellDetails = getSpellData(feat.actor!);
    if (!spellDetails.hasSpellSlots)
      return { canBeUsed: false, spendSpellSlot: false };
    return { canBeUsed: true, spendSpellSlot: true };
  }
  return { canBeUsed: true, spendSpellSlot: false };
};

const applyEffects = async (feat: Item<'feat'>, workflow: Workflow) => {
  const target = workflow.hitTargets.first() as Token;
  const quarryDie = (
    feat.actor!.system.scale['alternate-ranger']?.[
      'quarry-die'
    ] as ScaleValueTypeDice
  ).die;
  // ? This will automate Beast Master's Primal Beast after updating to Foundry v14
  // const beastMasterPrimalBeast =
  //   '(rollingActor.summonerActor.tokenId === effectOriginTokenId && \
  //    rollingActor.summonerActor.classes["alternate-ranger"].subclass === "beast-master" \
  //    && rollingActor.summonerActor.classes["alternate-ranger"].levels >= 7)';
  const {
    utils: { itemUtils },
  } = chrisPremades;
  const beguilingStrikes = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eBeguilingStrikes',
  );
  // Some subclass features change the damage type of Ranger's Quarry
  let alterDamageType = '';
  if (beguilingStrikes) alterDamageType = '[psychic]';
  const targetChanges: EffectChange[] = [
    {
      key: 'flags.automated-conditions-5e.grants.damage.bonus',
      mode: 0,
      value: `bonus=1${quarryDie}${alterDamageType}; hasAttack && tokenId === effectOriginTokenId;`,
      priority: 20,
    },
    {
      key: 'flags.automated-conditions-5e.grants.attack.noDisadvantage',
      mode: 0,
      value: `effectOriginActor.classes['alternate-ranger'].levels >= 5 && tokenId === effectOriginTokenId;`,
      priority: 20,
    },
  ];
  // Some subclass features add extra damage to Ranger's Quarry
  const ruthlessFocus = itemUtils.getItemByIdentifier(
    feat.actor!,
    'ac55eRuthlessFocus',
  );
  if (ruthlessFocus)
    targetChanges.push({
      key: 'flags.automated-conditions-5e.grants.damage.bonus',
      mode: 0,
      value: `bonus=max(1,rollingActor.abilities.wis.mod); hasAttack && tokenId === effectOriginTokenId;`,
      priority: 20,
    });
  // Slayer II knack extends duration indefinitely
  const slayerII = itemUtils.getItemByIdentifier(feat.actor!, 'ac55eSlayerII');
  const duration: EffectDuration = slayerII ? {} : { seconds: 3600 };
  const targetMacros: { type: string; macros: string[] }[] = [];
  if (itemUtils.getItemByIdentifier(feat.actor!, 'ac55eRelentlessHunter'))
    targetMacros.push({
      type: 'midi.actor',
      macros: [
        'ac55eRelentlessHunterApply',
        'ac55eRuthlessFocusHordeBreakerBonus',
      ],
    });
  await applySourceTargetInterdependentEffects({
    feat,
    target,
    duration,
    targetChanges,
    targetMacros,
  });
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat);
  if (!res1) return;
  await applyEffects(feat, workflow);
  if (res1.spendSpellSlot) await spendLowestLevelSpellSlot(feat.actor);
};

const macro: CPRMacro = {
  identifier: 'ac55eRangersQuarry',
  name: "Ranger's Quarry",
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: preAutomatedApply,
        priority: 100,
      },
    ],
    item: [
      {
        pass: 'rollFinished',
        macro: workflow,
        priority: 100,
        activities: ['use'],
      },
    ],
  },
};

export default macro;
