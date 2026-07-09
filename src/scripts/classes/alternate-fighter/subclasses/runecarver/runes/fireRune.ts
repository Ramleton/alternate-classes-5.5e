import { Workflow } from '@midi-qol/types/module/Workflow.js';
import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';
import { getAltMartialExploitDie } from 'exploits/utils.js';
import { generateOverTimeEffectChange } from '../../../../../automation/effectUtils.js';
import { isRuneInvokable, postRune as post } from './runeUtils.js';

const pre = async (feat: Item<'feat'>, workflow: Workflow) => {
  const {
    utils: { dialogUtils, socketUtils },
  } = chrisPremades;
  if (workflow.activity?.getActionType() !== 'mwak') return false;
  if (!workflow.hitTargets.size) return false;
  const res = isRuneInvokable(feat);
  if (!res.usable) return false;
  return await dialogUtils.confirm(
    feat.name,
    'You hit a creature with a melee weapon attack. Invoke Fire Rune?',
    { userId: socketUtils.firstOwner(feat.actor, true) },
  );
};
const during = async (feat: Item<'feat'>, workflow: Workflow) => {
  const exploitDie = getAltMartialExploitDie(feat);
  if (!exploitDie) return false;
  const target = workflow.hitTargets.first()! as Token;
  const invokeWorkflow = await runActivity(feat, 'invoke', [target]);
  if (!invokeWorkflow?.failedSaves?.size) return true;
  const dmgFormula = `2d${exploitDie.faces}`;
  const {
    utils: { effectUtils, genericUtils },
  } = chrisPremades;
  await genericUtils.setFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.fire',
    dmgFormula,
  );
  const overTimeChange = generateOverTimeEffectChange('Fire Rune: Restrained', {
    label: 'Fire Rune: Restrained',
    turn: 'start',
    saveAbility: 'str',
    saveDC: invokeWorkflow.saveDC,
    saveMagic: true,
    damageRoll: dmgFormula,
    damageType: 'fire',
    damageBeforeSave: true,
    saveCount: '1-',
    actionSave: 'roll',
    allowIncapacitated: true,
  });
  const fireRuneEffect = {
    name: 'Fire Rune: Restrained',
    icon: feat.img,
    duration: { seconds: 60 },
    flags: {
      'chris-premades': {
        info: {
          identifier: 'ac55eFireRuneEffect',
        },
      },
    },
    statuses: new Set(['restrained']),
    changes: [overTimeChange],
  };
  await effectUtils.createEffect(target.actor!, fireRuneEffect);
  return true;
};
const workflow: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  const feat = item as Item<'feat'>;
  const res1 = await pre(feat, workflow);
  if (!res1) return;
  const res2 = await during(feat, workflow);
  if (!res2) return;
  await post(feat);
};

const fireRuneDamage: MidiMacroFunction = async ({
  trigger: { entity: item },
  workflow,
}) => {
  if (!workflow.hitTargets.size) return '';
  const feat = item as Item<'feat'>;
  const formula =
    feat.actor!.flags['alternate-classes-55e']?.macros?.runeCarver?.fire;
  if (!formula) return;
  const {
    utils: { genericUtils, workflowUtils },
  } = chrisPremades;
  await workflowUtils.bonusDamage(workflow, formula, { damageType: 'fire' });
  await genericUtils.unsetFlag(
    feat.actor!,
    'alternate-classes-55e',
    'macros.runeCarver.fire',
  );
};

const macro: CPRMacro = {
  identifier: 'ac55eFireRune',
  name: 'Runecarver Runes: Fire Rune',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: workflow,
        priority: 200,
      },
      {
        pass: 'damageRollComplete',
        macro: fireRuneDamage,
        priority: 100,
      },
    ],
  },
};

export default macro;
