import {
  ALTERNATE_MARTIAL_MULTICLASSING_RECORD,
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
    const multiclassLevel = Object.keys(actor.classes).reduce(
      (acc, altClass) => {
        if (!(altClass in ALTERNATE_MARTIAL_MULTICLASSING_RECORD)) return acc;
        const altClassRecord = ALTERNATE_MARTIAL_MULTICLASSING_RECORD[altClass];
        if (typeof altClassRecord === 'number') {
          acc += Math.floor(
            actor.classes[altClass].system.levels / altClassRecord,
          );
        } else {
          const classItem = actor.classes[altClass];
          const altSubclassIdentifier = (
            classItem as { subclass?: { identifier: string } }
          ).subclass?.identifier;
          if (!altSubclassIdentifier) return acc;
          if (!(altSubclassIdentifier in altClassRecord)) return acc;
          const altSubclassRecord = altClassRecord[altSubclassIdentifier];
          acc += Math.floor(
            actor.classes[altClass].system.levels / altSubclassRecord,
          );
        }
        return acc;
      },
      0,
    );
    await genericUtils.setFlag(actor, 'alternate-classes-55e', 'exploitData', {
      dice: getAlternateMartialExploitDice(multiclassLevel),
      die: getAlternateMartialExploitDie(multiclassLevel),
    });
    console.log(
      `[Alternate Classes 5.5e]: Successfully updated ${actor.name}'s Exploit Data`,
    );
  },
);
