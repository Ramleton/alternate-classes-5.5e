import { HandleEnchantedShot } from '../handle.js';
import { createEnchantedShotTargetEffectData } from './targetEffectDataFactory.js';

const handleUmbralShot: HandleEnchantedShot = async ({
  item,
  saveWorkflow,
}) => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const targetEffectData = createEnchantedShotTargetEffectData({
    item,
    nameSuffix: 'Blinded',
    identifierSuffix: 'UmbralShotEffect',
    saveDC: saveWorkflow.saveDC,
    saveAbility: 'int',
    statuses: ['blinded'],
  });
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor) continue;
    await effectUtils.createEffect(target.actor, targetEffectData, {
      rules: 'modern',
    });
  }
  return true;
};

export default handleUmbralShot;
