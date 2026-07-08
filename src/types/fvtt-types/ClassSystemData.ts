export default class ClassSystemData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends foundry.abstract.DataModel<any, any>
{
  declare advancement: Record<string, unknown>;
  declare description: { chat: string; value: string };
  declare hd: {
    additional: number;
    denomination: 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
    max: number;
    spent: number;
    value: number;
  };

  declare identifier: string;
  declare isOriginalClass: boolean;
  declare levels: number;
  declare primaryAbility: {
    all: boolean;
    value: Set<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'>;
  };

  declare properties: Set<string>;
  declare source: {
    book: string;
    bookPlaceholder: string;
    custom?: string;
    label: string;
    license?: string;
    page?: string;
    revision: number;
    rules: '2014' | '2024';
    slug: string;
    value: string;
    directlyEditable: boolean;
  };

  declare spellcasting: {
    ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    attack: number;
    levels: number;
    preparation: {
      formula: string;
      max: number;
      value: number;
    };
    progression: string;
    save: number;
    slots: boolean;
    type: string;
  };

  declare startingEquipment: unknown[];
  declare tier: number;
  declare wealth: string;
  declare type: 'class';
  declare subclass: Item | null;
  [key: string]: unknown;
}
