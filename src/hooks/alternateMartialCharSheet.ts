import {
  ALTERNATE_MARTIAL_MULTICLASSING_RECORD,
  calcAlternateMartialMulticlassLevel,
  getExploitDegree,
  isAlternateMartialExploit,
} from 'exploits/utils.js';

interface ExploitTabAlternateMartialClass {
  id: string;
  uuid: string;
  subclassUuid?: string;
  name: string;
  img: string;
  level: number;
  saveDC: string;
  hasSubclass: boolean;
  subclassName?: string;
  subclassImg?: string;
}

interface ExploitSaveDCInfo {
  type: 'devious' | 'martial' | 'savage';
  ability:
    | 'dexterity'
    | 'strength'
    | 'constitution'
    | 'intelligence'
    | 'wisdom'
    | 'charisma';
}

const exploitSaveDCRecord: Record<
  string,
  [ExploitSaveDCInfo, ExploitSaveDCInfo]
> = {
  'alternate-rogue': [
    {
      type: 'devious',
      ability: 'dexterity',
    },
    {
      type: 'devious',
      ability: 'strength',
    },
  ],
};

Hooks.once('init', () => {
  const SheetClass = dnd5e.applications.actor.CharacterActorSheet;

  SheetClass.TABS.push({
    tab: 'exploits',
    label: 'Exploits',
    icon: 'fas fa-sword',
  });

  SheetClass.PARTS.exploits = {
    container: { classes: ['tab-body'], id: 'tabs' },
    template: 'modules/alternate-classes-55e/assets/templates/exploitsTab.hbs',
    templates: ['systems/dnd5e/templates/inventory/inventory.hbs'],
    scrollable: [''],
  };

  console.log(
    '[Alternate Classes 5.5e]: Added Alternate Martial Exploits Tab to Character Sheets',
  );
});

const getSaveDC = (actor: Actor5e, altClass: string): string => {
  const classRecord = exploitSaveDCRecord[altClass];
  if (!classRecord) return '—';
  const saveDCOptions = exploitSaveDCRecord[altClass].map((sdc) => ({
    key: `${sdc.type}-exploits-${sdc.ability}-save`,
    ability: sdc.ability,
  }));
  const activeOption = saveDCOptions.find((sdc) => actor.system.scale[sdc.key]);
  if (!activeOption) return '—';
  const abilityModifiers: Record<ExploitSaveDCInfo['ability'], number> = {
    dexterity: actor.system.abilities.dex.mod,
    strength: actor.system.abilities.str.mod,
    constitution: actor.system.abilities.con.mod,
    intelligence: actor.system.abilities.int.mod,
    wisdom: actor.system.abilities.wis.mod,
    charisma: actor.system.abilities.cha.mod,
  };
  const profBonus = actor.system.attributes.prof ?? 2;
  return (8 + abilityModifiers[activeOption.ability] + profBonus).toString();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Hooks.on('dnd5e.prepareSheetContext' as any, (sheet, partId, context) => {
  if (partId !== 'exploits') return;
  if (sheet.actor.type !== 'character') return;
  const Inventory = customElements.get(
    sheet.options.elements.inventory,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  if (!Inventory) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exploitItems = (context.items as Item[]).filter((i: any) =>
    isAlternateMartialExploit(i),
  ) as Item<'feat'>[];

  const columns = Inventory.mapColumns([
    { id: 'uses', order: 200 },
    'recovery',
    'controls',
  ]);

  const sections: {
    columns: unknown[];
    id: string;
    label: string;
    items: unknown[];
  }[] = [];

  for (let degree = 1; degree <= 5; degree++) {
    const degreeExploits = exploitItems.filter(
      (i) => getExploitDegree(i) === degree,
    );

    // Only create a section if there are items for this degree
    if (degreeExploits.length > 0) {
      sections.push({
        columns,
        id: `degree-${degree}`,
        label: `Degree ${degree}`,
        items: degreeExploits,
      });
    }
  }

  const preparedSections =
    sections.length > 0 ? Inventory.prepareSections(sections) : [];

  context.sections = preparedSections;

  context.listControls = {
    label: 'Search Exploits',
    list: 'exploits',
    filters: [],
    sorting: [
      {
        key: 'a',
        label: 'SIDEBAR.SortModeAlpha',
        dataset: {
          icon: 'fa-solid fa-arrow-down-a-z',
        },
      },
    ],
    grouping: [],
  };

  const exploitData = sheet.actor.flags['alternate-classes-55e']?.exploitData;

  context.label = 'Exploits';

  context.exploitDice = {
    value: (exploitData?.dice ?? 0) - (exploitData?.spent ?? 0),
    max: exploitData?.dice ?? 0,
    die: exploitData?.die ?? null,
  };

  const activeClasses: ExploitTabAlternateMartialClass[] = Object.keys(
    sheet.actor.classes,
  ).reduce((acc: ExploitTabAlternateMartialClass[], altClass) => {
    if (!(altClass in ALTERNATE_MARTIAL_MULTICLASSING_RECORD)) return acc;
    const altClassRecord = ALTERNATE_MARTIAL_MULTICLASSING_RECORD[altClass];
    if (typeof altClassRecord === 'number') {
      const classItem = sheet.actor.classes[altClass];
      const saveDC = getSaveDC(sheet.actor, altClass);
      acc.push({
        id: altClass,
        uuid: classItem.uuid,
        name: classItem.name,
        img: classItem.img,
        level: classItem.system.levels,
        saveDC,
        hasSubclass: false,
      });
    } else {
      const classItem = sheet.actor.classes[altClass];
      const altSubclass = (
        classItem as {
          subclass: { name: string; img?: string; identifier: string };
        }
      ).subclass;
      const altSubclassIdentifier = altSubclass.identifier;
      if (!altSubclassIdentifier) return acc;
      if (!(altSubclassIdentifier in altClassRecord)) return acc;
      const saveDC = getSaveDC(sheet.actor, altSubclassIdentifier);
      acc.push({
        id: altClass,
        uuid: classItem.uuid,
        subclassUuid: sheet.actor.classes[altClass].subclass.uuid,
        name: `${classItem.name} (${sheet.actor.classes[altClass].subclass.name})`,
        img: sheet.actor.classes[altClass].img,
        level: sheet.actor.classes[altClass].system.levels,
        saveDC,
        hasSubclass: true,
        subclassName: altSubclass.name,
        subclassImg: altSubclass.img || 'icons/svg/mystery-man.svg',
      });
    }
    return acc;
  }, []);

  context.activeClasses = activeClasses;
  context.multiclassLevel = calcAlternateMartialMulticlassLevel(sheet.actor);
  context.multiclassTable = [
    { level: '3rd - 4th', die: 'd4', count: 2 },
    { level: '5th - 10th', die: 'd6', count: 3 },
    { level: '11th - 16th', die: 'd8', count: 4 },
    { level: '17th - 20th', die: 'd10', count: 5 },
  ];
});
