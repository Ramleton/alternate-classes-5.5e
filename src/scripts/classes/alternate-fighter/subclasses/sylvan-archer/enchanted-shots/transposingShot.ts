import { HandleEnchantedShot } from '../handle.js';

const handleTransposingShot: HandleEnchantedShot = async ({
  workflow,
  saveWorkflow,
}) => {
  const { Teleport, utils: { itemUtils } } = chrisPremades;
  const target = workflow.hitTargets.first() as Token;
  if (![...saveWorkflow.failedSaves].filter(s => s.id === target.id).length)
    return false;
  const playAnimation = itemUtils.getConfig(workflow.item, 'playAnimation');
  const origTeleport = new Teleport(
    [workflow.token!],
    workflow.token!,
    { animation: playAnimation ? 'mistyStep' : 'none' },
  );
  const newTeleport = new Teleport(
    [target],
    target,
    { animation: playAnimation ? 'mistyStep' : 'none' },
  );
  const origPos = workflow.token!.center;
  const newPos = target.center;
  origTeleport.template = {
    direction: 0,
    x: newPos.x,
    y: newPos.y,
  };
  newTeleport.template = {
    direction: 0,
    x: origPos.x,
    y: origPos.y,
  };
  await Promise.all([origTeleport._move(), newTeleport._move()]);
  return true;
};

export default handleTransposingShot;
