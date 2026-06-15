import CPRMacro from 'chris-premades/macro.js';
import { runActivity } from 'exploits/handling/exploitUtils.js';

const useMasterfulFocus = async ({
  trigger: { entity: item, token },
  workflow,
}): Promise<void> => {
  const itemIdentifier = workflow
    ?.item
    .flags['chris-premades']
    ?.info
    ?.identifier || '';
  if (!['ac55eSecondWind', 'ac55eActionSurge'].includes(itemIdentifier))
    return;
  await runActivity(item, 'use', [token]);
};
const macro: CPRMacro = {
  identifier: 'ac55eMasterfulFocus',
  name: 'Masterful Focus',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: useMasterfulFocus,
        priority: 50,
      },
    ],
  },
};

export default macro;
