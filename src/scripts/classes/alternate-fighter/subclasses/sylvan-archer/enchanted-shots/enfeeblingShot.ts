import { HandleEnchantedShot } from '../handle.js';
import { createEnchantedShotTargetEffectData } from './targetEffectDataFactory.js';

const handleEnfeeblingShot: HandleEnchantedShot = async ({
  item,
  saveWorkflow,
}) => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const targetEffectData = createEnchantedShotTargetEffectData({
    item,
    nameSuffix: 'Enfeebled',
    identifierSuffix: 'EnfeeblingShotEffect',
    saveDC: saveWorkflow.saveDC,
  });
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor) continue;
    await effectUtils.createEffect(target.actor, targetEffectData, {
      rules: 'modern',
      macros: {
        midi: {
          actor: ['ac55eEnfeeblingShotEffect'],
        },
      },
    });
  }
  return true;
};

export default handleEnfeeblingShot;
