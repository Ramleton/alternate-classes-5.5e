import {
  getAlternateMartialExploitDice,
  getAlternateMartialExploitDie,
} from 'exploits/utils.js';

Hooks.on(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'dnd5e.advancementManagerComplete' as any,
  async ({ actor }: { actor: Actor5e }) => {
    if (!actor) return;
    const {
      utils: { genericUtils },
    } = chrisPremades;
    console.log(
      `[Alternate Classes 5.5e]: Updating ${actor.name}'s Exploit Data`,
    );
    const newLevelDice = getAlternateMartialExploitDice(actor);
    const newLevelDie = getAlternateMartialExploitDie(actor);
    const prevSpent =
      actor.flags['alternate-classes-55e']?.exploitData?.spent ?? 0;
    await genericUtils.setFlag(actor, 'alternate-classes-55e', 'exploitData', {
      dice: newLevelDice,
      die: newLevelDie,
      spent: prevSpent,
    });
    console.log(
      `[Alternate Classes 5.5e]: Successfully updated ${actor.name}'s Exploit Data`,
    );
  },
);
