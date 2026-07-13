import { meleeWeaponAttackHitCheck } from 'automation/weaponUtils.js';
import {
  getWorkflowProperty,
  setWorkflowProperty,
} from 'automation/workflowUtils.js';
import CPRMacro, {
  MacroFunction,
  MidiMacroFunction,
} from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';

const useEtherealScourge: MidiMacroFunction = async ({
  trigger: { entity, token },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!meleeWeaponAttackHitCheck({ feat, token, workflow })) return;
  const space = feat.flags['alternate-classes-55e']?.spectralWarriorsSpace;
  if (space !== feat.actor!.uuid!) return;
  const {
    utils: { dialogUtils, genericUtils, socketUtils },
  } = chrisPremades;
  const target = workflow.hitTargets.first()! as Token;
  const selection = await dialogUtils.confirm(
    feat.name,
    `Command your Spectral Warriors to surround ${target.name}?`,
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
  if (!selection) return;
  await genericUtils.update(feat, {
    'flags.alternate-classes-55e.spectralWarriorsSpace': target.actor!.uuid,
  });
};

const etherealScourge: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!workflow.targets.size) return;
  if (workflow.actor.uuid === feat.actor!.uuid) return;
  const space = feat.flags['alternate-classes-55e']?.spectralWarriorsSpace;
  if (space !== workflow.actor.uuid) return;
  const target = workflow.targets.first() as Token;
  if (target.actor!.uuid === feat.actor!.uuid) return;
  workflow.tracker.disadvantage.add(feat.name, feat.name);
  setWorkflowProperty(workflow, feat.actor!, 'etherealScourgeUsed', true);
};

const etherealScourgeResistance: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!workflow.hitTargets.size) return;
  const used = getWorkflowProperty(
    workflow,
    feat.actor!,
    'etherealScourgeUsed',
  );
  if (!used) return;
  const effectData: EffectData = {
    name: feat.name,
    icon: feat.img!,
    duration: { seconds: 1 },
    origin: feat.uuid!,
    flags: {
      dae: {
        stackable: 'noneName',
      },
    },
    changes: [
      {
        key: 'system.traits.dr.value',
        mode: 2,
        value: 'ALL',
        priority: 0,
      },
    ],
    statuses: [],
  };
  const {
    utils: { effectUtils, workflowUtils },
  } = chrisPremades;
  const target = workflow.targets.first() as Token;
  const effect = await effectUtils.createEffect(target.actor!, effectData);
  await workflowUtils.addEntityRemoval(workflow, [effect]);
};

const resetSpectralWarriors: MacroFunction = async ({
  trigger: { entity },
}) => {
  const feat = entity as Item<'feat'>;
  const {
    utils: { genericUtils },
  } = chrisPremades;
  await genericUtils.setFlag(
    feat,
    'alternate-classes-55e',
    'spectralWarriorsSpace',
    feat.actor!.uuid!,
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eSpectralWarriors',
  name: 'Path Of The Ancestors: Spectral Warriors',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'scenePreAttackRollConfig',
        macro: etherealScourge,
        priority: 0,
      },
      {
        pass: 'attackRollComplete',
        macro: useEtherealScourge,
        priority: 0,
      },
      {
        pass: 'sceneAttackRollComplete',
        macro: etherealScourgeResistance,
        priority: 0,
      },
    ],
    item: [
      {
        pass: 'rollFinished',
        macro: resetSpectralWarriors,
        priority: 0,
        activities: ['use'],
      },
    ],
  },
  combat: [
    {
      pass: 'turnStartSource',
      macro: resetSpectralWarriors,
      priority: 0,
    },
  ],
};

export default macro;
