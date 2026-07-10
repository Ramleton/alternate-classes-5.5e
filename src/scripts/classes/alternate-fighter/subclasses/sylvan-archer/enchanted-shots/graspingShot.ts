import { HandleEnchantedShot } from '../handle.js';
import { createEnchantedShotTargetEffectData } from './targetEffectDataFactory.js';

const handleGraspingShot: HandleEnchantedShot = async ({
  item,
  saveWorkflow,
}) => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const targetEffectData = createEnchantedShotTargetEffectData({
    item,
    nameSuffix: 'Grasped',
    identifierSuffix: 'GraspingShotEffect',
    changes: [
      {
        key: 'system.attributes.movement.all',
        mode: 0,
        value: '*0.5',
        priority: 20,
      },
    ],
    saveDC: saveWorkflow.saveDC,
    saveAbility: 'dex',
  });
  // const targetEffectData = {
  //   name: `${item.name}: Grasped`,
  //   icon: item.img,
  //   origin: item.uuid,
  //   duration: { seconds: 60 },
  //   flags: {
  //     dae: {
  //       stackable: 'noneName',
  //     },
  //     'alternate-classes-55e': {
  //       macros: {
  //         enchantedShot: {
  //           graspingShot: {
  //             moved: false,
  //             exploitDie: getAlternateMartialExploitDie(item.actor!),
  //             originActor: item.actor,
  //           },
  //         },
  //       },
  //     },
  //     'chris-premades': {
  //       info: {
  //         identifier: 'ac55eGraspingShotEffect',
  //       },
  //       macros: {
  //         movement: ['ac55eGraspingShotEffectMoved'],
  //         combat: ['ac55eGraspingShotEffectReset'],
  //       },
  //     },
  //   },
  //   changes: [
  //     {
  //       key: 'flags.midi-qol.OverTime',
  //       mode: 0,
  //       value: [
  //         'turn=start',
  //         'label=Grasping Shot',
  //         'rollType=check',
  //         'saveAbility=str',
  //         `saveDC=${saveWorkflow.saveDC}`,
  //         'saveCount=1-',
  //         'actionSave=roll',
  //         'allowIncapacitated=true',
  //       ].join(', '),
  //       priority: 20,
  //     },
  //     {
  //       key: 'system.attributes.movement.all',
  //       mode: 0,
  //       value: '*0.5',
  //       priority: 20,
  //     },
  //   ],
  // };
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor) continue;
    await effectUtils.createEffect(target.actor, targetEffectData, {
      rules: 'modern',
    });
  }
  return true;
};

export default handleGraspingShot;
