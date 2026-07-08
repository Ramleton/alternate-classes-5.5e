import { Workflow } from '@midi-qol/types/module/Workflow';

interface Die {
  faces: number;
  formula: string;
}

type TotalMulticlassingLevel =
  | 1
  | 2
  | 3
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

interface ExploitsToDegrees {
  // 1st Degree Exploits
  'arresting-strike': 1;
  'brace-up': 1;
  disarm: 1;
  'feat-of-strength': 1;
  feint: 1;
  'first-aid': 1;
  'heroic-fortitude': 1;
  hurl: 1;
  'imposing-presence': 1;
  'mighty-leap': 1;
  'mighty-thrust': 1;
  parry: 1;
  'precision-strike': 1;
  riposte: 1;
  'ruthless-strike': 1;
  'shield-impact': 1;
  'skilled-rider': 1;
  'sweeping-strike': 1;
  // 2nd Degree Exploits
  'blinding-debris': 2;
  'concussive-blow': 2;
  'crippling-strike': 2;
  'defensive-stance': 2;
  'heroic-will': 2;
  'honor-duel': 2;
  'martial-focus': 2;
  'menacing-shout': 2;
  redirect: 2;
  'rending-strike': 2;
  volley: 2;
  'whirlwind-strike': 2;
  // 3rd Degree Exploits
  'disorienting-blow': 3;
  'heroic-focus': 3;
  'mighty-shot': 3;
  'mythic-athleticism': 3;
  'mythic-resilience': 3;
  'war-cry': 3;
  // 4th Degree Exploits
  'expert-focus': 4;
  'fluid-movements': 4;
  'quick-draw': 4;
  'staggering-blow': 4;
  unbreakable: 4;
  // 5th Degree Exploits
  'steel-wind-slash': 5;
  'storm-of-arrows': 5;
}

export type ExploitActivityIdentifier = 'save' | 'use' | 'damage';

interface MacroPassToExploit {
  attackRollComplete: string[];
  postAttackRoll: string[];
  targetAttackRollComplete: string[];
  targetApplyDamage: string[];
  targetDamageRollComplete: string[];
}

export interface AlternateClasses55e {
  api: {
    isMartialArtsAttack({ workflow }: { workflow: Workflow }): boolean;

    isMartialArtsAttack({ workflow }: { workflow: Workflow }): boolean;

    alternateMartialExploitMulticlassingTable: ExploitMulticlassingTable;

    altMartialExploitsToDegrees: ExploitsToDegrees;

    macroPassToExploit: MacroPassToExploit;

    exploitTypes: ['martialExploit', 'savageExploit', 'deviousExploit'];

    alternateMartialExploitMulticlassingValues(
      totalLevel: number,
    ): ExploitMulticlassingRow;

    getAltMartialExploitDieForMulticlassLevel(totalLevel: number): Die;

    getAltMartialMCTotalLevel(actor: Actor): number;

    getAltMartialMCExploitsRemaining(totalLevel: number): number;

    getAltMartialExploitsRemaining(item: Item): number;

    getAlternateMartialExploits(actor: Actor): {
      martialExploits: Item | undefined;
      savageExploits: Item | undefined;
      deviousExploits: Item | undefined;
    };

    spendAlternateMartialExploitUses(uses: number, actor: Actor): Promise<void>;

    getAlternateMartialExploitDie(entity: Item | Actor5e): Die;
  };
}

export default AlternateClasses55e;
