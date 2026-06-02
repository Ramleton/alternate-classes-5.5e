import { Workflow } from '@midi-qol/types/module/Workflow';

interface Die {
  faces: number;
  formula: string;
}

type TotalMulticlassingLevel = 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

type ExploitDie = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

interface ExploitMulticlassingRow {
  totalLevel: TotalMulticlassingLevel;
  exploitDie: ExploitDie;
  exploitDice: number;
}

type ExploitMulticlassingTable = [
  { totalLevel: 1; exploitDie: 'd4'; exploitDice: 2 },
  { totalLevel: 2; exploitDie: 'd4'; exploitDice: 2 },
  { totalLevel: 3; exploitDie: 'd4'; exploitDice: 2 },
  { totalLevel: 4; exploitDie: 'd4'; exploitDice: 2 },
  { totalLevel: 5; exploitDie: 'd6'; exploitDice: 3 },
  { totalLevel: 6; exploitDie: 'd6'; exploitDice: 3 },
  { totalLevel: 7; exploitDie: 'd6'; exploitDice: 3 },
  { totalLevel: 8; exploitDie: 'd6'; exploitDice: 3 },
  { totalLevel: 9; exploitDie: 'd6'; exploitDice: 3 },
  { totalLevel: 10; exploitDie: 'd6'; exploitDice: 3 },
  { totalLevel: 11; exploitDie: 'd8'; exploitDice: 4 },
  { totalLevel: 12; exploitDie: 'd8'; exploitDice: 4 },
  { totalLevel: 13; exploitDie: 'd8'; exploitDice: 4 },
  { totalLevel: 14; exploitDie: 'd8'; exploitDice: 4 },
  { totalLevel: 15; exploitDie: 'd8'; exploitDice: 4 },
  { totalLevel: 16; exploitDie: 'd8'; exploitDice: 4 },
  { totalLevel: 17; exploitDie: 'd10'; exploitDice: 5 },
  { totalLevel: 18; exploitDie: 'd10'; exploitDice: 5 },
  { totalLevel: 19; exploitDie: 'd10'; exploitDice: 5 },
  { totalLevel: 20; exploitDie: 'd10'; exploitDice: 5 },
];

export interface AlternateClasses55eAPI {
  api: {
    isMartialArtsAttack(
      { workflow }: { workflow: Workflow },
    ): boolean;

    isMartialArtsAttack(
      { workflow }: { workflow: Workflow },
    ): boolean;

    alternateMartialExploitMulticlassingTable: ExploitMulticlassingTable;

    alternateMartialExploitMulticlassingValues(
      totalLevel: number
    ): ExploitMulticlassingRow;

    getAltMartialExploitDieForMulticlassLevel(totalLevel: number): Die;

    getAltMartialMCTotalLevel(actor: Actor): number;

    getAltMartialMCExploitsRemaining(
      totalLevel: number
    ): number;

    getAltMartialExploitsRemaining(actor: Actor): number;

    getAlternateMartialExploits(actor: Actor): {
      martialExploits: Item | undefined;
      savageExploits: Item | undefined;
      deviousExploits: Item | undefined;
    };

    spendAlternateMartialExploitUses(uses: number, actor: Actor): Promise<void>;

    getAlternateMartialExploitDie(item: Item): Die;
  };
}
