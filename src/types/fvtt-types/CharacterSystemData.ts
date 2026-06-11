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
  modifiers: Set<string>;
  number: number | null;
  [key: string]: unknown;
}

export type ScaleValue
  = | ScaleValueType
    | ScaleValueTypeNumber
    | ScaleValueTypeDice;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CharacterSystemData extends foundry.abstract.DataModel<any, any> {
  scale: Record<string, Record<string, ScaleValue>>;
  classes: Record<string, Item<'class'>>;
  [key: string]: unknown;
}

export default CharacterSystemData;
