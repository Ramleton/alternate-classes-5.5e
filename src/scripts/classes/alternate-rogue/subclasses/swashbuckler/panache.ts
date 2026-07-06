import { runActivity } from 'automation/utils.js';
import CPRMacro from 'chris-premades/macro.js';
import { CunningStrikeSubclassFeatureHandler } from '../../types/cunningStrike.js';

export const handlePanache: CunningStrikeSubclassFeatureHandler = async ({
  trigger: { entity, token },
  selectedFeature,
  target,
}) => {
  const {
    utils: { dialogUtils, socketUtils, tokenUtils },
  } = chrisPremades;
  const nearbyTargets = tokenUtils
    .findNearby(token, 30, 'any', {
      includeIncapacitated: false,
      includeToken: false,
    })
    .filter((t) => tokenUtils.canSee(t, token));
  if (!nearbyTargets.length) return;
  const options: [string, string][] = [['Taunt', 'taunt']];
  if (nearbyTargets.length) options.push(['Charm', 'charm']);
  const feat = entity as Item<'feat'>;
  const userId = socketUtils.firstOwner(feat.actor!, true);
  const selectedOption = await dialogUtils.buttonDialog(
    'Swashbuckler: Panache',
    'Select a Panache option.',
    options,
    { userId },
  );
  if (!selectedOption) return;
  if (selectedOption === 'charm') {
    const selectedTarget = await dialogUtils.selectTargetDialog(
      'Panache: Charm',
      'Select a target to charm',
      nearbyTargets,
      { userId },
    );
    if (!selectedTarget || !selectedTarget[0]) return;
    return await runActivity(selectedFeature, 'charm', [selectedTarget[0]]);
  }
  await runActivity(selectedFeature, 'taunt', [target]);
};

const macro: CPRMacro = {
  identifier: 'ac55ePanache',
  name: 'Swashbuckler: Panache',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
};

export default macro;
