import { Workflow } from '@midi-qol/types/module/Workflow';
import CPRMacro from 'chris-premades/macro.js';
import { getAltMartialExploitsRemaining } from 'exploits/utils.js';

const ENCHANTED_SHOTS = [
  'banishing-shot',
  'beguiling-shot',
  'bursting-shot',
  'enfeebling-shot',
  'grasping-shot',
  'piercing-shot',
  'umbral-shot',
  'severing-shot',
  'technical-shot',
  'transposing-shot',
] as const;

async function pre(
  item: Item<'feat'>,
  workflow: Workflow,

): Promise<[string, string][]> {
  const { utils: { itemUtils } } = chrisPremades;
  const usableShots: [string, string][] = [];
  // ? Only one Enchanted Shot per D20 Test
  if (item.actor!.flags['alternate-classes-55e']?.macros?.enchantedShot?.used)
    return usableShots;
  if (workflow.activity.getActionType() !== 'rwak')
    return usableShots;
  if (!workflow.hitTargets.size)
    return usableShots;
  // ? Remove Enchanted Shots that cannot be used by the actor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enchantedShotsItem: any = itemUtils.getItemByIdentifier(
    item.actor!,
    'ac55eEnchantedShots',
  );
  if (!enchantedShotsItem) return usableShots;
  if (!enchantedShotsItem?.system?.uses?.value
    && !getAltMartialExploitsRemaining(item)
  )
    return usableShots;
  const enchantedShots: [string, string][] = ENCHANTED_SHOTS
    .map((e) => {
      return [
        e.split('-').map(n => n[0].toUpperCase() + n.slice(1)).join(' '),
        e,
      ];
    });
  for (const shot of enchantedShots) {
    const foundShots = item.actor!.items
      .filter(i => i.system.identifier === shot[1]);
    if (foundShots.length) {
      usableShots.push(shot);
    }
  }
  return usableShots;
}

async function post(item: Item<'feat'>, selection: string): Promise<void> {
  if (!selection) return;
  const { utils: {
    itemUtils,
    dialogUtils,
    genericUtils,
    socketUtils,
  } } = chrisPremades;
  const legendarySylvanArcher = itemUtils.getItemByIdentifier(
    item.actor!,
    'ac55eLegendarySylvanArcher',
  );
  if (legendarySylvanArcher?.system?.uses?.value) {
    const useLegendarySylvanArcher = await dialogUtils.confirm(
      'Legendary Sylvan Archer',
      'Use Legendary Sylvan Archer?',
      { userId: socketUtils.firstOwner(item.actor!, true) },
    );
    if (useLegendarySylvanArcher) {
      await genericUtils.setFlag(
        item.actor!,
        'alternate-classes-55e',
        'macros.enchantedShot.legendarySylvanArcher',
        1,
      );
      await genericUtils.update(
        legendarySylvanArcher,
        { 'system.uses.spent':
          legendarySylvanArcher.system.uses.spent + 1,
        },
      );
    }
  }
  await genericUtils.setFlag(
    item.actor!,
    'alternate-classes-55e',
    `macros.enchantedShot.${selection}`,
    1,
  );
  await genericUtils.setFlag(
    item.actor!,
    'alternate-classes-55e',
    'macros.enchantedShot.used',
    1,
  );
}

async function workflow({ trigger: { entity: item }, workflow }) {
  const { utils: { dialogUtils } } = chrisPremades;
  const feat = item as Item.OfType<'feat'>;
  if (!feat.actor) return;
  const res1 = await pre(feat, workflow);
  if (!res1.length) return;
  const selection = await dialogUtils.buttonDialog(
    'Enchanted Shots',
    'Attack roll successful, use an enchanted shot?',
    res1,
  );
  await post(feat, selection);
}

const macro: CPRMacro = {
  name: 'Enchanted Shots: Prompt',
  identifier: 'ac55eEnchantedShotPrompt',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: workflow,
        priority: 110,
      },
    ],
  },
};

export default macro;
