import { HandleEnchantedShot } from '../handle.js';

const handleSeveringShot: HandleEnchantedShot = async ({
  item,
  saveWorkflow,
}) => {
  const { utils: { effectUtils } } = chrisPremades;
  const targetEffectData = {
    name: `${item.name}: Cannot cast spells`,
    icon: item.img,
    origin: item.uuid,
    duration: { seconds: 60 },
    flags: {
      'dae': {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eSeveringShotEffect',
        },
        macros: {
          midi: {
            actor: ['ac55eSeveringShotEffect'],
          },
        },
      },
    },
    changes: [{
      key: 'flags.midi-qol.OverTime',
      mode: 0,
      value: `turn=end,allowIncapacitated=true,saveAbility=con,\
        saveDC=${saveWorkflow.saveDC},saveDamage=nodamage,saveRemove=true,\
        saveMagic=true,rollMode=publicroll,`,
    }],
  };
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor) continue;
    await effectUtils.createEffect(target.actor, targetEffectData, {
      rules: 'modern',
    });
  }
  return true;
};

export default handleSeveringShot;
