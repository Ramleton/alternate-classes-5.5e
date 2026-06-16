import { Workflow } from '@midi-qol/types/module/Workflow.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectChange, EffectData } from '../../../../../../types/effects.js';
import { postRune, preRune } from './runeUtils.js';

const pre = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<boolean> => {
  if (!workflow.targets.size)
    return false;
  return await preRune(feat);
};
const during = async (
  feat: Item<'feat'>,
  workflow: Workflow,
): Promise<boolean> => {
  const { utils: { effectUtils, genericUtils } } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.hill',
    1,
  );
  const changes: EffectChange[] = [];
  for (const type of ['bludgeoning', 'piercing', 'slashing']) {
    changes.push({
      key: `system.traits.dr.value`,
      mode: 2,
      value: type,
      priority: 20,
    });
  }
  const hillRuneEffect: EffectData = {
    name: 'Hill Rune',
    icon: feat.img,
    duration: { seconds: 600 },
    flags: {
      'dae': {
        stackable: 'noneName',
        // eslint-disable-next-line @stylistic/max-len
        enableCondition: '!effects.some(e => e.name.toLowerCase() === \'incapacitated\')',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eHillRuneEffect',
        },
      },
    },
    changes,
    origin: '',
    statuses: [],
  };
  await effectUtils.createEffect(workflow.actor, hillRuneEffect);
  return true;
};
const post = async (feat: Item<'feat'>) => {
  await postRune(feat);
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.unsetFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.hill',
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
  identifier: 'ac55eHillRune',
  name: 'Runecarver Runes: Hill Rune',
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
