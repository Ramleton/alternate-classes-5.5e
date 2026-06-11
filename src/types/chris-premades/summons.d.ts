/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Summons {
  constructor(sourceActors, updates, originItem, summonerToken, options);
  static spawn(
    sourceActors,
    updates?: any,
    originItem: Item,
    summonerToken: Token,
    options?: {
      duration?: number;
      callbacks?: any;
      range?: number;
      animation?: 'default' | string;
      onDeleteMacros?: any;
      concentrationNonDependent?: boolean;
      initiativeType?: 'separate' | 'all' | 'follows';
      additionalVaeButtons?: any[];
      additionalSummonVaeButtons?: any[];
      dontDismissOnDefeat?: boolean;
      dismissActivity?: any;
      unhideActivities?: any;
      customIdentifier?: string;
    }
  ): Promise<Token[]>;
  static socketSpawn(
    actorUuid: string,
    updates: any[],
    sceneUuid: string
  ): Promise<string>;
  static dismiss({ trigger }): Promise<void>;
  static dismissIfDead({ trigger, ditem }): Promise<boolean>;
  static getSummonItem(
    name: string,
    updates: any[],
    originItem: Item,
    options?: {
      flatAttack?: boolean;
      flatDC?: boolean;
      damageBonus?: number;
      translate?: boolean;
      identifier?: string;
      damageFlat?: number;
      rules?: 'legacy' | 'modern';
      compendium?: string;
    }
  ): Promise<any>;
  prepareAllData(): Promise<void>;
  prepareData(): Promise<void>;
  spawnAll(): Promise<void>;
  handleSpecialUpdates(): Promise<void>;
  handleEffects(): Promise<void>;
  handleInitiative(): Promise<void>;
  mergeUpdates(updates): void;
}
