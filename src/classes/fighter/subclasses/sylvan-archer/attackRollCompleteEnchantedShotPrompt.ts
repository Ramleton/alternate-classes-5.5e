import { Workflow } from '@midi-qol/types/module/Workflow';
import { dialogUtils, genericUtils, itemUtils } from 'chrisPremades';
import AlternateClasses55e from '../../../../types/alternate-classes-55e';

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
];

async function pre(
  item,
  altClassesModule: AlternateClasses55e,
  workflow: Workflow,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const usableShots: [string, string][] = [];
  // ? Only one Enchanted Shot per D20 Test
  if (item.actor.flags['alternate-classes-55e']?.macros?.enchantedShot?.used)
    return usableShots;
  if (workflow.activity.getActionType() !== 'rwak')
    return usableShots;
  // ? Remove Enchanted Shots that cannot be used by the actor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enchantedShotsItem: any = itemUtils.getItemByIdentifier(
    item.actor,
    'ac55eEnchantedShots',
  );
  if (!enchantedShotsItem) return usableShots;
  if (!enchantedShotsItem?.system?.uses?.value
    && !altClassesModule.api.getAltMartialExploitsRemaining(item)
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
    const foundShots = item.actor.items
      .filter(i => i.identifier === shot[1]);
    if (foundShots.length) {
      usableShots.push(shot);
    }
  }
  return usableShots;
}

async function post(item, selection: string): Promise<void> {
  if (!selection) return;
  await genericUtils.setFlag(
    item.actor,
    'alternate-classes-55e',
    `macros.enchantedShot.${selection}`,
    1,
  );
  await genericUtils.setFlag(
    item.actor,
    'alternate-classes-55e',
    'macros.enchantedShot.used',
    1,
  );
}

async function workflow({ trigger: { entity: item }, workflow }) {
  const altClassesModule = game
    .modules.get('alternate-classes-55e') as AlternateClasses55e | undefined;
  if (!altClassesModule)
    return;
  const res1 = await pre(item, altClassesModule, workflow);
  if (!res1.length) return;
  const selection = await dialogUtils.buttonDialog(
    'Enchanted Shots',
    'Attack roll successful, use an enchanted shot?',
    res1,
  );
  await post(item, selection);
}

export const ac55eAttackRollCompleteEnchantedShotPrompt = {
  name: 'Attack Roll Complete: Enchanted Shots',
  version: '1.3.141',
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
