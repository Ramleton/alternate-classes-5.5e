import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { EffectChange } from '../../../../../../types/effects.js';
import { postRune, preRune } from './runeUtils.js';

const pre = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<boolean> => {
  if (!workflow.targets.size)
    return false;
  return await preRune(feat, 'frost');
};
const during = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<boolean> => {
  const exploitDie = getAlternateMartialExploitDie(feat);
  if (!exploitDie)
    return false;
  const bonusFormula = `1d${exploitDie.faces}`;
  const { utils: { effectUtils, genericUtils } } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.frost',
    1,
  );
  const changes: EffectChange[] = [{
    key: 'system.attributes.movement.all',
    mode: 0,
    value: '+10',
    priority: 20,
  }];
  for (const ability of ['str', 'con']) {
    changes.push({
      key: `system.abilities.${ability}.bonuses.check`,
      mode: 2,
      value: bonusFormula,
      priority: 20,
    });
    changes.push({
      key: `system.abilities.${ability}.bonuses.save`,
      mode: 2,
      value: bonusFormula,
      priority: 20,
    });
  }
  const frostRuneEffect = {
    name: 'Frost Rune',
    icon: feat.img,
    duration: { seconds: 600 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eFrostRuneEffect',
        },
      },
    },
    changes,
  };
  await effectUtils.createEffect(workflow.actor, frostRuneEffect);
  return true;
};
const post = async (feat: Item<'feat'>) => {
  await postRune(feat, 'frost');
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.unsetFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.frost',
  );
};
const workflow: MidiMacroFunction = async ({
  trigger: { entity: item }, workflow },
) => {
  const feat = item as Item<'feat'>;
  const res1 = await pre(feat, workflow);
  if (!res1)
    return;
  const res2 = await during(feat, workflow);
  if (!res2)
    return;
  await post(feat);
};
const macro: CPRMacro = {
  identifier: 'ac55eFrostRune',
  name: 'Runecarver Runes: Frost Rune',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'rollFinished',
        macro: workflow,
        priority: 200,
        activities: ['invoke'],
      },
    ],
  },
};

export default macro;
