import CPRMacro, { MacroFunction } from 'chris-premades/macro.js';
import { getAlternateMartialExploitDie } from 'exploits/utils.js';
import { postRune as post, preRune as pre } from './runeUtils.js';

const during = async (feat: Item<'feat'>): Promise<boolean> => {
  const exploitDie = getAlternateMartialExploitDie(feat);
  if (!exploitDie)
    return false;
  const { utils: { effectUtils, genericUtils } } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.storm',
    1,
  );
  const stormRuneEffect = {
    name: 'Storm Rune: Prophecy',
    icon: feat.img,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eStormRuneEffect',
        },
        macros: {
          skill: ['ac55eStormRuneProphecy'],
          save: ['ac55eStormRuneProphecy'],
          midi: {
            actor: ['ac55eStormRuneProphecy'],
          },
        },
      },
    },
  };
  await effectUtils.createEffect(feat.actor!, stormRuneEffect, {
    concentrationItem: feat,
    strictlyInterdependent: true,
    rules: 'modern',
  });
  return true;
};
const workflow: MacroFunction = async (
  { trigger: { entity: item } },
) => {
  const feat = item as Item<'feat'>;
  const res1 = await pre(feat);
  if (!res1)
    return;
  const res2 = await during(feat);
  if (!res2)
    return;
  await post(feat);
};
const macro: CPRMacro = {
  identifier: 'ac55eStormRune',
  name: 'Runecarver Runes: Storm Rune',
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
