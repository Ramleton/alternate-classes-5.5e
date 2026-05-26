import {
  activityUtils,
  constants,
  actorUtils,
  dialogUtils,
  effectUtils,
  genericUtils,
  itemUtils,
  socketUtils,
  tokenUtils,
  workflowUtils,
} from 'chris-premades/scripts/utils.js';

async function typhoonStrike({ trigger: { entity: item }, workflow, ditem }) {
  let validWeapons = workflow.actor.items.filter(
    (i) =>
      i.type === 'weapon' &&
      i.system.equipped &&
      i.system.prof.hasProficiency &&
      (i.system.type.value === 'simpleM' ||
        (i.system.type.value === 'martialM' &&
          !i.system.properties.some((p) => p === 'hvy' || p === 'spc'))),
  );
  if (!validWeapons.length) {
    genericUtils.notify('CHRISPREMADES.Macros.TrueStrike.NoWeapons', 'warn');
    return;
  }
  let selectedWeapon;
  if (validWeapons.length === 1) {
    selectedWeapon = validWeapons[0];
  } else {
    selectedWeapon = await dialogUtils.selectDocumentDialog(
      workflow.item.name,
      'CHRISPREMADES.Macros.TrueStrike.SelectWeapon',
      validWeapons,
    );
  }
  if (!selectedWeapon) return;
  const nearbyTargets = tokenUtils.findNearby(
    workflow.token,
    selectedWeapon.system.range.reach,
    'all',
    {
      includeIncapacitated: true,
      includeToken: false,
    },
  );
  if (!nearbyTargets.length) return;
  await workflowUtils.updateTargets(workflow, nearbyTargets);
}

export const ac55eTyphoonStrike = {
  name: 'Typhoon Strike',
  version: '1.3.141',
  rules: 'modern',
  midi: {
    item: [
      {
        pass: 'preambleComplete',
        macro: typhoonStrike,
        priority: 50,
        activities: ['save'],
      },
    ],
  },
};
