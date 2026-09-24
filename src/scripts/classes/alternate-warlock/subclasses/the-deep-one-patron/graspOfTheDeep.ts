import { generateOverTimeEffectChange } from 'automation/effectUtils.js';
import { runActivity } from 'automation/utils.js';
import { MidiActiveEffect } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';
import {
  addEldritchBlastHandler,
  EldritchBlastHandler,
  EldritchBlastPreCheck,
} from '../../class-features/handling/eldritchBlastHandlerFactory.js';
import { getRemainingPactMagicSlots } from '../../utils.js';

const preCheck: EldritchBlastPreCheck = async ({
  trigger: { entity },
  workflow,
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  const actor = feat.actor;
  if (!actor) return false;
  const target = workflow.hitTargets.first() as Token;

  const {
    utils: { actorUtils, itemUtils, effectUtils },
  } = chrisPremades;
  const greaterTendrils = itemUtils.getItemByIdentifier(
    actor,
    'ac55eGreaterTendrils',
  );
  const targetSize = actorUtils.getSize(target.actor!, false);
  const targetSizeLimit = greaterTendrils ? 4 : 3;
  if (targetSize > targetSizeLimit) return false;

  const hasColdDamage = ditem!.damageDetail.some((d) => d.type === 'cold');
  if (!hasColdDamage) return false;
  const oceanicGraspEffect = effectUtils.getEffectByIdentifier(
    actor,
    'ac55eOceanicGraspEffect',
  ) as unknown as MidiActiveEffect;

  // If Oceanic Grasp has at least 2 stacks, Grasp of the Deep can be used for free
  if ((oceanicGraspEffect?.flags?.dae?.stacks || 0) >= 2) return true;
  return !!feat.system.uses!.value || !!getRemainingPactMagicSlots(actor);
};

const handle: EldritchBlastHandler = async ({ workflow, feature }) => {
  const target = workflow.hitTargets.first() as Token;
  await runActivity(feature, 'apply', [target]);
  const {
    utils: { itemUtils, effectUtils },
  } = chrisPremades;
  const greaterTendrils = itemUtils.getItemByIdentifier(
    feature.actor!,
    'ac55eGreaterTendrils',
  );
  if (!greaterTendrils) return;

  const graspOfTheDeep = effectUtils.getEffectByIdentifier(
    target.actor!,
    'ac55eGraspOfTheDeepEffect',
  );
  const change = generateOverTimeEffectChange('Greater Tendrils: Damage', {
    label: 'Greater Tendrils: DoT',
    turn: 'start',
    rollType: 'damage',
    damageType: 'cold',
    damageRoll: '2d8',
  });
  const effectData: EffectData = {
    name: 'Greater Tendrils: DoT',
    icon: greaterTendrils.img!,
    duration: {},
    origin: greaterTendrils.uuid!,
    flags: {},
    changes: [change],
    statuses: [],
  };
  await effectUtils.createEffect(target.actor!, effectData, {
    parentEntity: graspOfTheDeep,
    strictlyInterdependent: true,
  });
};

addEldritchBlastHandler({
  pass: 'applyDamage',
  cprIdentifier: 'ac55eGraspOfTheDeep',
  exclusive: false,
  automatic: false,
  preCheck,
  handle,
});
