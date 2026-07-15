import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { DamageActivity } from 'fvtt-types/Activity.js';
import { getElementDamage } from './heartOfChaos.js';

const startOfTurnDamage: MacroFunction = async ({
  trigger: { entity, token, target },
}) => {
  const feat = entity as Item<'feat'>;
  if (!target) return;
  const {
    utils: { tokenUtils, workflowUtils },
  } = chrisPremades;
  if (!target) return;
  const whirlwindRadius = feat.actor!.system.scale['path-of-elemental-chaos']?.[
    'elemental-whirlwind-radius'
  ] as string | undefined;
  if (!whirlwindRadius) return;
  if (tokenUtils.getDistance(token, target) > Number(whirlwindRadius)) return;
  const element = getElementDamage(feat.actor!);
  if (!element) return;
  const exploitDie = getAlternateMartialExploitDie(feat.actor!);
  if (!exploitDie) return;
  const damageActivity = (await getActivityData(feat, 'damage')) as
    DamageActivity | undefined;
  if (!damageActivity) return;
  const conMod = feat.actor!.system.abilities.con.mod;
  damageActivity.damage.parts[0].custom.formula = `1${exploitDie} + ${conMod}`;
  damageActivity.damage.parts[0].types = [element];
  await workflowUtils.syntheticActivityDataRoll(
    damageActivity,
    feat,
    feat.actor!,
    [target],
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eGreaterWhirlwind',
  name: 'Path of Elemental Chaos: Greater Whirlwind',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  combat: [
    {
      pass: 'turnStartNear',
      macro: startOfTurnDamage,
      priority: 0,
    },
  ],
};

export default macro;
