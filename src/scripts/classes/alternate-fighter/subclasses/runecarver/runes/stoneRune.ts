import { runActivity } from 'automation/utils.js';
import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAltMartialExploitDie } from 'exploits/utils.js';
import { generateOverTimeEffectChange } from '../../../../../automation/effectUtils.js';
import { isRuneInvokable, postRune } from './runeUtils.js';

const pre = async (feat: Item<'feat'>, target: Token | undefined) => {
  if (!target) return false;
  const res = isRuneInvokable(feat);
  if (!res.usable) return false;
  const {
    utils: { dialogUtils, socketUtils },
  } = chrisPremades;
  return await dialogUtils.confirm(
    feat.name,
    // eslint-disable-next-line @stylistic/max-len
    `${target.actor!.name} ended their turn within 30 feet of you, invoke Stone Rune?`,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
};
const during = async (feat: Item<'feat'>, target: Token): Promise<boolean> => {
  const exploitDie = getAltMartialExploitDie(feat);
  if (!exploitDie) return false;
  const invokeWorkflow = await runActivity(feat, 'invoke', [target]);
  if (!invokeWorkflow?.failedSaves?.size) return true;
  const {
    utils: { effectUtils, genericUtils },
  } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.stone',
    1,
  );
  const overTimeChange = generateOverTimeEffectChange('Stone Rune: Dreaming', {
    label: 'Stone Rune: Dreaming',
    turn: 'end',
    saveAbility: 'wis',
    saveDC: invokeWorkflow.saveDC,
    saveMagic: true,
    saveCount: '1-',
    allowIncapacitated: true,
  });
  const stoneRuneEffect = {
    name: 'Stone Rune: Dreaming',
    icon: feat.img,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eStoneRuneEffect',
        },
      },
    },
    statuses: new Set(['incapacitated']),
    changes: [
      overTimeChange,
      {
        key: 'system.attributes.movement.all',
        mode: 0,
        value: '0',
        priority: 20,
      },
    ],
  };
  await effectUtils.createEffect(target.actor!, stoneRuneEffect);
  return true;
};
const workflow: MacroFunction = async ({
  trigger: { entity: item, target },
}) => {
  const feat = item as Item<'feat'>;
  const res1 = await pre(feat, target);
  if (!res1) return;
  const res2 = await during(feat, target!);
  if (!res2) return;
  await postRune(feat);
};
const macro: CPRMacro = {
  identifier: 'ac55eStoneRune',
  name: 'Runecarver Runes: Stone Rune',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  combat: [
    {
      pass: 'turnEndNear',
      macro: workflow,
      priority: 200,
      disposition: 'enemy',
      distance: 30,
    },
  ],
};

export default macro;
