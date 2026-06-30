import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectChange, EffectData } from 'types/effects.js';
import { isQuarry } from '../../utils/quarryUtils.js';

const downgradeTraitsOfQuarry: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const {
    utils: { constants, effectUtils, workflowUtils },
  } = chrisPremades;
  const actionType = workflowUtils.getActionType(workflow);
  if (!constants.weaponAttacks.some((type) => type === actionType)) return;
  const target = workflow.hitTargets.first() as Token;
  const targetActor = target.actor;
  if (!targetActor) return;
  const feat = entity as Item<'feat'>;
  if (!isQuarry(feat.actor!, targetActor)) return;
  const downgrades = Array.from(targetActor.system.traits.di.value);
  const changes = downgrades
    .map((i) => ({
      key: 'system.traits.di.value',
      mode: 2,
      value: '-' + i,
      priority: 20,
    }))
    .concat(
      downgrades.map((i) => ({
        key: 'system.traits.dr.value',
        mode: 2,
        value: i,
        priority: 20,
      })),
    ) as EffectChange[];
  const effectData: EffectData = {
    name: feat.name,
    icon: feat.img!,
    origin: feat.uuid!,
    duration: {
      seconds: 1,
    },
    changes,
    flags: {
      dae: {
        stackable: 'noneName',
        specialDuration: ['isDamaged'],
      },
      'chris-premades': {
        effect: {
          noAnimation: true,
        },
      },
    },
    statuses: [],
  };
  await effectUtils.createEffect(targetActor, effectData);
};

const macro: CPRMacro = {
  identifier: 'ac55eMonstersNemesis',
  name: "Monster Slayer: Monster's Nemesis",
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'damageRollComplete',
        macro: downgradeTraitsOfQuarry,
        priority: 100,
      },
    ],
  },
};

export default macro;
