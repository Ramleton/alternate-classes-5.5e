import { HandleEnchantedShot } from '../handle';

const handleBeguilingShot: HandleEnchantedShot = async ({
  item,
  saveWorkflow,
}) => {
  const { utils: { effectUtils } } = chrisPremades;
  const targetEffectData = {
    name: `${item.name}: Charmed`,
    icon: item.img,
    origin: item.uuid,
    duration: { seconds: 60 },
    flags: {
      'dae': {
        stackable: 'noneName',
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eBeguilingShotEffect',
        },
      },
    },
    statuses: ['charmed'],
  };
  for (const target of saveWorkflow.failedSaves) {
    if (!target.actor) continue;
    await effectUtils.createEffect(target.actor, targetEffectData, {
      rules: 'modern',
    });
  }
  return true;
};

export default handleBeguilingShot;
