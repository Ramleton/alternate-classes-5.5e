import CPRMacro, { MacroFunction } from 'chris-premades/macro';

const workflow: MacroFunction = async ({
  trigger: { entity: effect },
}) => {
  const { utils: { genericUtils } } = chrisPremades;
  await genericUtils.setFlag(
    effect,
    'alternate-classes-55e',
    'graspingShot.moved',
    false,
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eGraspingShotEffectReset',
  name: 'Grasping Shot: Reset',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  combat: [{
    pass: 'everyTurn',
    macro: workflow,
    priority: 10,
  }],
};

export default macro;
