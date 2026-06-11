interface UsesRecovery {
  period: string;
  type: string;
  formula?: string;
}

export default interface ItemUses {
  label: string;
  max: number;
  value: number;
  spent: number;
  recovery: UsesRecovery[];
  period: string;
}
