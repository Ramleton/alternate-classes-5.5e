export interface ScaleValueType {
  value: string;
  [key: string]: unknown;
}

export interface ScaleValueTypeNumber {
  value: number;
  [key: string]: unknown;
}

export interface ScaleValueTypeDice {
  faces: number;
  die: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  modifiers: Set<string>;
  number: number | null;
  [key: string]: unknown;
}

export type ScaleValue =
  ScaleValueType | ScaleValueTypeNumber | ScaleValueTypeDice;

export default class CharacterSystemData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends foundry.abstract.DataModel<any, any>
{
  declare scale: Record<string, Record<string, ScaleValue>>;
  declare classes: Record<string, Item<'class'>>;
  [key: string]: unknown;
}
