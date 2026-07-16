import { runActivity } from 'automation/utils.js';
import CPRMacro, { MidiMacroFunction } from 'chris-premades/macro.js';

const handle: MidiMacroFunction = async ({ trigger: { entity, token } }) => {
  const feat = entity as Item<'feat'>;
  if (!feat.system.uses?.value) return;
  const {
    utils: { effectUtils },
  } = chrisPremades;
  if (!effectUtils.getEffectByIdentifier(feat.actor!, 'ac55eRecklessAttack'))
    return;
  const conMod = feat.actor!.system.abilities.con.mod;
  const healAmount = Math.max(1, conMod);
  if (feat.actor!.system.attributes.hp.temp >= healAmount) return;
  await runActivity(feat, 'heal', [token]);
};

const macro: CPRMacro = {
  identifier: 'ac55eBattleHysteria',
  name: 'Path of Blood and Iron: Battle Hysteria',
  source: 'Alternate Classes 5.5e',
  version: '1.0.0',
  rules: 'modern',
  midi: {
    actor: [
      {
        pass: 'attackRollComplete',
        macro: handle,
        priority: 0,
      },
    ],
  },
};

export default macro;
