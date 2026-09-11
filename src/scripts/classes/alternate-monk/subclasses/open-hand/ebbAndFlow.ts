import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { SaveActivity } from 'fvtt-types/Activity.js';

type HelperFunction = (feat: Item<'feat'>, workflow: Workflow) => Promise<void>;

const handleTopplingBlow: HelperFunction = async (feat, workflow) => {
  const saveActivity = (await getActivityData(feat, 'save')) as
    SaveActivity | undefined;
  if (!saveActivity) return;
  const sizeMap = {
    tiny: 1,
    sm: 2,
    med: 3,
    lg: 4,
    huge: 5,
    grg: 6,
  };
  const saveAdvantage =
    sizeMap[workflow.actor.system.traits.size] >
    sizeMap[feat.actor!.system.traits.size as keyof typeof sizeMap];
  const {
    utils: { effectUtils, workflowUtils },
  } = chrisPremades;
  let saveAdvantageEffect: ActiveEffect | undefined = undefined;
  if (saveAdvantage) {
    const effectData = {
      name: 'Toppling Blow Advantage',
      icon: feat.img,
      origin: feat.uuid,
      duration: { turns: 1 },
      changes: [
        {
          key: 'flags.midi-qol.advantage.save.dex',
          mode: 0,
          value: 1,
          priority: 0,
        },
      ],
    };
    saveAdvantageEffect = await effectUtils.createEffect(
      workflow.actor,
      effectData,
    );
  }
  await workflowUtils.syntheticActivityRoll(saveActivity, [workflow.token!], {
    consumeUsage: true,
  });
  if (saveAdvantageEffect) await saveAdvantageEffect.delete();
};

const handleSwiftReprisal: HelperFunction = async (feat, workflow) => {
  const {
    utils: { dialogUtils, genericUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const distance = tokenUtils.getDistance(
    workflow.token!,
    workflow.hitTargets.first() as Token,
  );
  const validWeapons = feat
    .actor!.items.filter(
      (i) => i.flags['chris-premades']?.info?.identifier === 'unarmedStrike',
    )
    .filter((i) => (i as Item<'weapon'>).system.range.reach! >= distance);
  if (!validWeapons.length) {
    genericUtils.notify('CHRISPREMADES.Macros.TrueStrike.NoWeapons', 'warn');
    return;
  }
  let selectedWeapon;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      feat.name,
      'CHRISPREMADES.Macros.TrueStrike.SelectWeapon',
      validWeapons,
    );
  }
  const punchActivity = getActivityData(selectedWeapon, 'punch');
  if (!punchActivity) return;
  const monkLevel = feat.actor!.classes['alternate-monk'].system.levels;
  const loopCount = monkLevel < 17 ? 1 : 2;
  for (let i = 0; i < loopCount; i++) {
    await workflowUtils.syntheticActivityDataRoll(
      punchActivity,
      selectedWeapon,
      feat.actor!,
      [workflow.token!],
      { consumeResources: true, consumeUsage: true },
    );
  }
};

const handle: MidiMacroFunction = async ({ trigger: { entity }, workflow }) => {
  if (workflow.hitTargets.size) return;
  const feat = entity as Item<'feat'>;
  const actor = feat.actor!;
  const {
    utils: { actorUtils, dialogUtils, socketUtils, workflowUtils },
  } = chrisPremades;
  if (actorUtils.hasUsedReaction(actor)) return;
  if (!workflowUtils.isAttackType(workflow, 'attack')) return;
  const actionType = workflowUtils.getActionType(workflow);
  const allowedAttacks = ['mwak', 'msak'];
  if (!allowedAttacks.includes(actionType)) return;
  const selection = await dialogUtils.confirmUseItem(feat, {
    userId: socketUtils.firstOwner(actor, true),
  });
  if (!selection) return;
  const buttons: [string, string][] = [
    ['Toppling Blow', 'save'],
    ['Swift Reprisal', 'use'],
  ];
  const optionSelection = await dialogUtils.buttonDialog(
    feat.name,
    'Choose one of the following options:',
    buttons,
    {
      userId: socketUtils.firstOwner(actor, true),
    },
  );
  if (!optionSelection) return;
  if (optionSelection === 'save')
    return await handleTopplingBlow(feat, workflow);
  return await handleSwiftReprisal(feat, workflow);
};

const macro: CPRMacro = {
  identifier: 'ac55eEbbAndFlow',
  name: 'Open Hand: Ebb and Flow',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 100,
      },
    ],
  },
};

export default macro;
