import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { getActivityData } from 'automation/utils.js';
import { getMeleeWeapons, getRangedWeapons } from 'automation/weaponUtils.js';
import CPRMacro, { DItem, Trigger } from 'chris-premades/macro.js';
import Activity, { AttackActivity, SaveActivity } from 'fvtt-types/Activity.js';

type WeaponSaveMacro = (__0: {
  trigger: Trigger;
  workflow: Workflow;
  ditem?: DItem;
  type: 'volley' | 'whirlwindStrike';
}) => Promise<void>;

const weaponSave: WeaponSaveMacro = async ({
  trigger: { entity },
  workflow,
  type,
}: {
  trigger: Trigger;
  workflow: Workflow;
  ditem?: DItem;
  type: 'volley' | 'whirlwindStrike';
}) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: { dialogUtils, socketUtils, tokenUtils, workflowUtils },
  } = chrisPremades;
  const validWeapons =
    type === 'volley'
      ? getRangedWeapons(feat.actor!)
      : getMeleeWeapons(feat.actor!);
  let selectedWeapon: Item<'weapon'> | undefined;
  const userId = socketUtils.firstOwner(feat.actor, true);
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon = (await dialogUtils.selectDocumentDialog(
      workflow.item.name,
      `${type === 'volley' ? 'Volley' : 'Whirlwind Strike'} with which equipped weapon?`,
      validWeapons,
      { userId },
    )) as Item<'weapon'> | undefined;
    if (!selectedWeapon) return;
  }
  const weaponAttackActivity = selectedWeapon.system.activities.filter(
    (a: Activity) => a.type === 'attack',
  )[0] as AttackActivity | undefined;
  if (!weaponAttackActivity) return;
  const saveActivityData = (await getActivityData(feat, type)) as
    SaveActivity | undefined;
  if (!saveActivityData) return;
  saveActivityData.damage.parts = weaponAttackActivity.damage.parts;
  let selectedTokens: Token[] = [];
  if (type === 'volley') {
    saveActivityData.range.value =
      '' + (selectedWeapon.system.range!.value ?? 0);
  } else {
    const nearbyTokens = tokenUtils.findNearby(
      workflow.token!,
      selectedWeapon.system.range.reach!,
      'any',
      { includeIncapacitated: true, includeToken: false },
    );
    if (!nearbyTokens.length) return;
    const res = await dialogUtils.selectTargetDialog(
      'Whirlwind Strike',
      'Select targets for the attack',
      nearbyTokens,
      { type: 'multiple', maxAmount: nearbyTokens.length },
    );
    if (!res || !res[0].length) return;
    selectedTokens = res[0];
  }
  await workflowUtils.syntheticActivityDataRoll(
    saveActivityData,
    feat,
    feat.actor!,
    selectedTokens,
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eHordeBreaker',
  name: 'Hunter: Horde Breaker',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: async (args) => {
          await weaponSave({ ...args, type: 'volley' });
        },
        priority: 100,
        activities: ['useVolley'],
      },
      {
        pass: 'rollFinished',
        macro: async (args) => {
          await weaponSave({ ...args, type: 'whirlwindStrike' });
        },
        priority: 100,
        activities: ['useWhirlwindStrike'],
      },
    ],
  },
};

export default macro;
