import { EffectData } from 'types/effects.js';
import subclassSmiteMacroFactory, { DuringSmiteCallback, preSmiteCallback, PreSmiteCallback } from '../utils/subclassSmiteFactory.js';

const preCallback: PreSmiteCallback = async ({ feat, workflow, ditem }) => {
  if (!ditem || ditem.newHP)
    return false;
  return await preSmiteCallback({ feat, workflow, ditem });
};

const duringCallback: DuringSmiteCallback = async ({
  feat,
  workflow,
  ditem,
}) => {
  ditem!.totalDamage = ditem!.oldHP + ditem!.oldTempHP - 1;
  const { utils: { effectUtils } } = chrisPremades;
  const sourceEffectData: EffectData = {
    name: 'Subduing Smite: Source',
    icon: feat.img!,
    duration: { seconds: 60 },
    origin: feat.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
        // eslint-disable-next-line @stylistic/max-len
        enableCondition: '!effects.some(e => e.name.toLowerCase() === \'incapacitated\')',
      },
    },
    changes: [],
    statuses: [],
  };
  const effect = await effectUtils.createEffect(
    workflow.actor,
    sourceEffectData,
  );
  const effectData: EffectData = {
    name: 'Subduing Smite: Charmed',
    icon: feat.img!,
    duration: { seconds: 60 },
    origin: effect.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
      },
    },
    changes: [],
    statuses: ['charmed'],
  };
  await effectUtils.createEffect(workflow.target.actor, effectData, {
    parentEntity: effect,
    strictlyInterdependent: true,
  });
};

export default await subclassSmiteMacroFactory({
  name: 'Subduing Smite',
  subclass: 'Oath of Repentance',
  priority: 50,
  macroPass: 'applyDamage',
  preCallback,
  duringCallback,
});
