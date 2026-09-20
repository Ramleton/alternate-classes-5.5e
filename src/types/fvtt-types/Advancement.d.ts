export interface Advancement {
  classRestriction: undefined;
  configuration: object;
  flags: Record<string, unknown>;
  hint: string;
  icon: string;
  level: number;
  title: string;
  type: string;
  value: unknown;
  levels: number[];
}

export interface TraitAdvancement extends Advancement {
  type: 'Trait';
  value: {
    chosen: Set<string>;
  };
  maxTraits: number;
}
