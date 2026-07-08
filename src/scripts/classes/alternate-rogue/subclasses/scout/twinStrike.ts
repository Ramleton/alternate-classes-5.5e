import { getWorkflowProperty } from 'automation/workflowUtils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { EffectData } from 'types/effects.js';

const markCreatureAsSneakAttacked: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!getWorkflowProperty(workflow, feat.actor!, 'sneakAttack')) return;
  const effectData: EffectData = {
    name: `${feat.name}: Sneak Attacked`,
    icon: feat.img!,
    duration: { turns: 1 },
    origin: feat.uuid!,
    flags: {
      dae: {
        specialDuration: ['turnStartSource'],
      },
      'chris-premades': {
        info: {
          identifier: 'ac55eSneakAttacked',
        },
      },
    },
    changes: [],
    statuses: [],
  };
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const target = workflow.hitTargets.first() as Token;
  await effectUtils.createEffect(target.actor!, effectData);
};

const macro: CPRMacro = {
  identifier: 'ac55eTwinStrike',
  name: 'Scout: Twin Strike',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'rollFinished',
        macro: markCreatureAsSneakAttacked,
        priority: 100,
      },
    ],
  },
};

export default macro;
