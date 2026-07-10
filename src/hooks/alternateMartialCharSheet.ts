import {
  ALTERNATE_MARTIAL_MULTICLASSING_RECORD,
  calcAlternateMartialMulticlassLevel,
  getExploitDegree,
  isAlternateMartialExploit,
} from 'exploits/utils.js';

interface ExploitTabAlternateMartialClass {
  name: string;
  level: number;
}

Hooks.once('init', () => {
  const SheetClass = dnd5e.applications.actor.CharacterActorSheet;

  SheetClass.TABS.push({
    tab: 'exploits',
    group: 'primary', // CRITICAL: This must match the sheet's primary tab group
    label: 'Exploits',
    icon: 'fas fa-sword',
  });

  SheetClass.PARTS.exploits = {
    template: 'modules/alternate-classes-55e/assets/templates/exploitsTab.hbs',
    id: 'exploits',
    container: { id: 'tabs' },
    scrollable: ['.inventory-list'],
  };

  const originalOnRender = SheetClass.prototype._onRender;
  SheetClass.prototype._onRender = function (context, options) {
    originalOnRender.call(this, context, options);

    // Check if 'exploits' is currently tracked as the active tab in this sheet instance's memory
    if (this.tabGroups?.primary === 'exploits') {
      // Find your tab element inside the newly rendered DOM container
      const exploitsTabEl = this.element.querySelector(
        '.tab[data-tab="exploits"]',
      );
      if (exploitsTabEl && !exploitsTabEl.classList.contains('active')) {
        exploitsTabEl.classList.add('active');
      }
    }
  };

  console.log(
    '[Alternate Classes 5.5e]: Added Alternate Martial Exploits Tab to Character Sheets',
  );
});

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
      acc.push({
        name: sheet.actor.classes[altClass].name,
        level: sheet.actor.classes[altClass].system.levels,
      });
    } else {
      const classItem = sheet.actor.classes[altClass];
      const altSubclassIdentifier = (
        classItem as { subclass?: { identifier: string } }
      ).subclass?.identifier;
      if (!altSubclassIdentifier) return acc;
      if (!(altSubclassIdentifier in altClassRecord)) return acc;
      acc.push({
        name: `${classItem.name} (${sheet.actor.classes[altClass].subclass.name})`,
        level: sheet.actor.classes[altClass].system.levels,
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
  // const tab = sheet.element.querySelector('[data-tab="exploits"]');
  // console.log(tab?.className);
});
