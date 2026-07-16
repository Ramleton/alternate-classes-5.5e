import { getActivityData } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { HealActivity } from 'fvtt-types/Activity.js';
import { DivineSmiteData } from '../../class-features/divineSmiteFactory.js';
import {
  DuringSmiteCallback,
  preSmiteCallback,
} from '../utils/subclassSmiteFactory.js';

const duringCallback: DuringSmiteCallback = async ({ feat }) => {
  const {
    utils: { genericUtils },
  } = chrisPremades;
  const smiteData = feat.actor!.flags['alternate-classes-55e']?.macros
    ?.divineSmite?.damage as DivineSmiteData | undefined;
  if (!smiteData) return;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.divineSmite.damage',
    { ...smiteData, damageType: 'necrotic' },
  );
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.drainingSmite',
    true,
  );
};

const workflow: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  const res1 = await preSmiteCallback({ feat, workflow });
  if (!res1) return;
  await duringCallback({ feat, workflow });
};

const late: MidiMacroFunction = async ({
  trigger: { entity },
  workflow,
  ditem,
}) => {
  const feat = entity as Item<'feat'>;
  if (!feat.actor) return;
  if (!ditem) return;
  if (!feat.actor.flags['alternate-classes-55e']?.macros?.drainingSmite) return;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  await genericUtils.unsetFlag(
    feat.actor,
    'alternate-classes-55e',
    'macros.drainingSmite',
  );
  const necroticDamage = workflowUtils.getTotalDamageOfType(
    ditem.damageDetail,
    workflow.targets.first()!.actor!,
    'necrotic',
  );
  if (!necroticDamage) return;
  const healActivityData = (await getActivityData(
    feat,
    'heal',
  )) as HealActivity;
  healActivityData.healing.custom.formula = Math.floor(necroticDamage / 2) + '';
  await workflowUtils.syntheticActivityDataRoll(
    healActivityData,
    feat,
    feat.actor,
    [],
  );
};

const drainingSmite: CPRMacro = {
  identifier: 'ac55eDrainingSmite',
  name: 'Oathless: Draining Smite',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: workflow,
        priority: 910,
      },
      {
        pass: 'applyDamage',
        macro: late,
        priority: 910,
      },
    ],
  },
};

export default drainingSmite;
