import { ALTERNATE_MARTIAL_EXPLOIT_TIERS } from 'exploits/config/exploitConfig.js';
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

type OrderedNumber = `${number}${'th' | 'st' | 'nd' | 'rd'}`;

const numberToOrdering = (num: number): OrderedNumber => {
  const strNum = num.toString();
  if (strNum.endsWith('1')) {
    if (strNum.endsWith('11')) return `${num}th`;
    return `${num}st`;
  }
  if (num.toString().endsWith('2')) {
    if (strNum.endsWith('12')) return `${num}th`;
    return `${num}nd`;
  }
  if (num.toString().endsWith('3')) {
    if (strNum.endsWith('13')) return `${num}th`;
    return `${num}rd`;
  }
  return `${num}th`;
};

// ? Hooks.on requires Foundry types for hooks, dnd5e hooks are not included
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
  ).reduce((acc: ExploitTabAlternateMartialClass[], altClassKey) => {
    const classItem: {
      identifier: string;
      name: string;
      img: string;
      system: { levels: number; [key: string]: unknown };
      uuid: string;
      subclass?: {
        identifier: string;
        uuid: string;
        name: string;
        img: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    } = sheet.actor.classes[altClassKey];
    if (!(altClassKey in ALTERNATE_MARTIAL_MULTICLASSING_RECORD)) return acc;
    const classConfig = ALTERNATE_MARTIAL_MULTICLASSING_RECORD[altClassKey];
    let subclassUuid: string | undefined;
    let subclassName: string | undefined;
    let subclassImg: string | undefined;
    let hasSubclass = false;
    let effectiveAltClassId = altClassKey;

    if (typeof classConfig !== 'number') {
      const altSubclass = classItem.subclass;
      const altSubclassIdentifier = altSubclass?.identifier;

      if (altSubclassIdentifier && altSubclassIdentifier in classConfig) {
        effectiveAltClassId = altSubclassIdentifier;
        subclassUuid = altSubclass.uuid;
        subclassName = altSubclass.name;
        subclassImg = altSubclass.img;
        hasSubclass = true;
      } else {
        return acc;
      }
    }

    const saveDC = getSaveDC(sheet.actor, effectiveAltClassId);
    acc.push({
      id: altClassKey,
      uuid: classItem.uuid,
      name: hasSubclass
        ? `${classItem.name} (${subclassName})`
        : classItem.name,
      img: classItem.img,
      level: classItem.system.levels,
      saveDC,
      hasSubclass,
      subclassUuid,
      subclassName,
      subclassImg,
    });
    return acc;
  }, []);

  context.activeClasses = activeClasses;
  context.multiclassLevel = calcAlternateMartialMulticlassLevel(sheet.actor);
  context.multiclassTable = ALTERNATE_MARTIAL_EXPLOIT_TIERS.map((tier) => ({
    level: `${numberToOrdering(tier.minLevel)} - ${numberToOrdering(tier.maxLevel)}`,
    count: tier.count,
    die: tier.die,
  }));
});
