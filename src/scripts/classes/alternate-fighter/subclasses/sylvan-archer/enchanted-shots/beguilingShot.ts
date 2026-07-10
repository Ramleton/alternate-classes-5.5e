import { HandleEnchantedShot } from '../handle.js';
import { createEnchantedShotTargetEffectData } from './targetEffectDataFactory.js';

const handleBeguilingShot: HandleEnchantedShot = async ({
  item,
  saveWorkflow,
}) => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const targetEffectData = createEnchantedShotTargetEffectData({
    item,
    nameSuffix: 'Charmed',
    identifierSuffix: 'BeguilingShotEffect',
    statuses: ['charmed'],
    saveDC: saveWorkflow.saveDC,
    saveAbility: 'wis',
  });
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor) continue;
    await effectUtils.createEffect(target.actor, targetEffectData, {
      rules: 'modern',
    });
  }
  return true;
};

export default handleBeguilingShot;
