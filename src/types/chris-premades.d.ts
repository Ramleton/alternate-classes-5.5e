declare module 'chrisPremades' {
  import type { Workflow } from '@midi-qol/types/module/Workflow';
  export interface DamageFormulaObject {
    /** The number of dice to roll (e.g., 2 in 2d6) */
    number?: number;
    /** The denomination of dice to roll (e.g., 6 in 2d6) */
    denomination?: number;
    /** Static flat bonus modifier string or expression (e.g., "@mod" or "5") */
    bonus?: string | number;
  }

  export const activityUtils: {
    /**
     * Retrieves an activity instance from an Item using its unique chris-premades string identifier.
     * @param item The Foundry VTT Item instance containing the activities.
     * @param identifier The unique custom identifier string assigned to the activity.
     * @param options Configuration options.
     * @param options.strict If true, throws an internal error if the activity cannot be located.
     */
    getActivityByIdentifier(
      item: Item,
      identifier: string,
      options?: { strict?: boolean }
    ): Item | null;

    getIdentifier(activity: object): string | null;

    setIdentifier(activity: object, identifier: string): Promise<void>;

    withChangedDamage(
      activity: object,
      formulaOrObj: string | DamageFormulaObject,
      types?: string[],
      options?: { specificIndex?: 0 }
    ): Item;

    duplicateActivity(activity: object): Item;

    getConditions(activity: object): Set<string>;

    getMod(activity: object): number;

    getSaveDC(activity: object): number | null;

    hasSave(activity: object): boolean;

    isSpellActivity(activity: object): boolean;

    canUse(activity: object): boolean;

    correctSpellLink(activity: object, spell: Item): Promise<Item>;

    isHidden(activity: object): boolean;
  };

  export const workflowUtils: {
    bonusDamage(
      workflow: Workflow,
      formula: DamageFormulaObject,
      options?: {
        ignoreCrit?: boolean;
        damageType?: string;
      }
    ): Promise<void>;

    bonusAttack(workflow: Workflow, formula: string): Promise<void>;

    replaceDamage(
      workflow: Workflow,
      formula: string,
      options?: {
        ignoreCrit?: boolean;
        damageType?: string;
      }
    ): Promise<void>;

    applyDamage(
      tokens: Token[],
      value: number,
      damageType: string
    ): Promise<void>;

    completeActivityUse(
      activity: object,
      config?: object,
      dialog?: object,
      message?: object
    ): Promise<Workflow>;

    completeItemUse(
      item: Item,
      config?: object,
      options?: object
    ): Promise<Workflow>;

    syntheticActivityRoll(
      activity: object,
      targets: Token[],
      options?: {
        options?: object;
        config?: object;
        userId?: string;
        atLevel?: number;
        consumeUsage?: boolean;
        consumeResources?: boolean;
        spellSlot?: boolean;
        dialog?: object;
        message?: object;
      }
    ): Promise<Workflow>;

    syntheticItemRoll(
      item: Item,
      targets: Token[],
      options?: {
        options?: object;
        config?: object;
        userId: string;
        consumeUsage?: boolean;
        consumeResources?: boolean;
        spellSlot?: boolean;
      }
    ): Promise<Workflow>;

    syntheticItemDataRoll(
      itemData: Item,
      actor: Actor,
      targets: Token[],
      options?: {
        options?: object;
        config?: object;
        killAnim?: boolean;
      }
    ): Promise<Workflow>;

    syntheticActivityDataRoll(
      activityData: object,
      item: Item,
      actor: Actor,
      targets: Token[],
      options?: {
        options?: object;
        config?: object;
        atLevel?: number;
        consumeUsage?: boolean;
        consumeResources?: boolean;
      }
    ): Promise<Workflow>;

    negateDamageItemDamage(ditem: object): void;

    setDamageItemDamage(
      ditem: object,
      damageAmount: number,
      adjustRaw?: boolean
    ): void;

    preventDeath(ditem: object): void;

    modifyDamageAppliedFlat(
      ditem: object,
      modificationAmount: number,
      options?: {
        type?: string;
        multiplier?: number
      }
    ): void;

    applyWorkflowDamage(
      sourceToken: TokenDocument,
      damageRoll: object,
      damageType: string,
      targets: object[],
      options?: {
        flavor?: string;
        itemCardId?: string;
      }
    ): Workflow;

    getDamageTypes(
      damageRolls: object[]
    ): Set<string>;

    getTotalDamageOfType(
      damageDetail: object,
      actor: Actor,
      type: string
    ): number;

    handleInstantTemplate(workflow: Workflow): Promise<void>;

    getCastData(workflow: Workflow): object;

    getCastLevel(workflow: Workflow): number;

    specialItemUse(
      item: Item,
      targets: Token[],
      options?: {
        options?: object;
        config?: object;
        userId: string;
        atLevel?: number;
        consumeUsage?: boolean;
        consumeResources?: boolean;
        spellSlot?: boolean;
        dialog?: object;
        message?: object;
      }
    ): Promise<Workflow>;

    updateTargets(
      workflow: Workflow,
      targets: Token[],
      options?: { userId?: string }
    ): Promise<void>;

    removeTargets(
      workflow: Workflow,
      targets: Token[],
      options?: { userId: string }
    ): Promise<void>;

    getActionType(workflow: Workflow): string;

    isAttackType(
      workflow: Workflow,
      type?:
        | 'attack'
        | 'meleeAttack'
        | 'weaponAttack'
        | 'spellAttack'
        | 'rangedWeaponAttack'
        | 'meleeWeaponAttack'
    ): boolean;

    swapAttackAbility(
      workflow: Workflow,
      ability?:
        | 'str'
        | 'dex'
        | 'con'
        | 'int'
        | 'wis'
        | 'cha',
      options?: {
        validTypes?: string[];
        checkHigher?: boolean;
      }
    ): Promise<void>;

    addEntityRemoval(
      workflow: unknown,
      entities: ActiveEffect[]
    ): Promise<void>;

    isSustainedRoll(workflow: Workflow): boolean;
  };

  export const effectUtils: {

    getCastData(effect: ActiveEffect): object;

    getCastLevel(effect: ActiveEffect): number | undefined;

    getBaseLevel(effect: ActiveEffect): number | undefined;

    setCastData(effect: ActiveEffect, data: object): Promise<void>;

    setCastLevel(effect: ActiveEffect, level: number): Promise<void>;

    setBaseLevel(effect: ActiveEffect, level: number): Promise<void>;

    getSaveDC(effect: ActiveEffect): number | undefined;

    setSaveDC(effect: ActiveEffect, level: number): Promise<void>;

    createEffect(
      actor: Actor,
      effectData: object,
      options?: {
        concentrationItem?: Item;
        parentEntity: object;
        identifier?: string;
        vae?: boolean;
        interdependent?: boolean;
        strictlyInterdependent?: boolean;
        unhideActivities?: boolean;
        rules?: object;
        macros?: object;
        conditions?: object;
        animate?: boolean;
        tokenImg?: string;
        avatarImg?: string;
        tokenImgPriority?: number;
        avatarImgPriority?: number;
        keepId?: boolean;
      },
      animationOptions?: {
        animationPath?: string;
        animationSize?: number;
        animationFadeIn?: number;
        animationFadeOut?: number;
        animationSound?: string;
      }
    ): Promise<ActiveEffect>;

    createEffects(
      entity: Actor,
      effectDataArray: object[],
      effectOptionsArray: object[]
    ): Promise<ActiveEffect[]>;

    addDependent(
      entity: object,
      dependents: object[],
      forceGM?: boolean
    ): Promise<void>;

    addMacro(
      effectData: object,
      type: string,
      macroList: object
    ): void;

    getConcentrationEffect(
      actor: Actor,
      concentrationItem: Item
    ): ActiveEffect;

    getEffectByIdentifier(
      actor: Actor,
      name: string
    ): ActiveEffect;

    getAllEffectsByIdentifier(
      actor: Actor,
      name: string
    ): ActiveEffect[];

    getEffectByStatusID(
      actor: Actor,
      statusID: string
    ): ActiveEffect;

    applyConditions(
      actor: Actor,
      conditions: string[],
      options?: {
        overlay?: boolean;
      }
    ): Promise<void>;

    sidebarEffectHelper(
      documentId: string,
      toggle: boolean
    ): Promise<void>;

    toggleSidebarEffect(documentId: string): Promise<void>;

    addSidebarEffect(documentId: string): Promise<void>;

    getSidebarEffectData(name: string): object;

    createEffectFromSidebar(
      actor: Actor,
      name: string,
      options?: {
        concentrationItem?: Item;
        parentEntity: object;
        identifier?: string;
        vae?: boolean;
        interdependent?: boolean;
        strictlyInterdependent?: boolean;
        unhideActivities?: boolean;
        rules?: object;
        macros?: object;
        conditions?: object;
        animate?: boolean;
        tokenImg?: string;
        avatarImg?: string;
        tokenImgPriority?: number;
        avatarImgPriority?: number;
        keepId?: boolean;
      }
    ): Promise<ActiveEffect>;

    syntheticActiveEffect(
      effectData: object,
      entity: object
    ): Promise<ActiveEffect>;

    getOriginItem(effect: ActiveEffect): Promise<Item>;

    getOriginItemSync(effect: ActiveEffect): Item;

    getConditions(effect: ActiveEffect): Set<string>;
  };

  export const dialogUtils: {
    buttonDialog(
      title: string,
      content: string,
      buttons: [
        string,
        string,
        { image?: string; displayAsRows?: boolean }
      ][],
      options?: {
        userId?: string;
      }
    ): Promise<object>;

    numberDialog(
      title: string,
      content: string,
      input?: {
        label?: string;
        name?: string;
        options?: object;
      },
      options?: {
        buttons?: string;
        userId?: string;
      }
    ): Promise<object>;

    selectDialog(
      title: string,
      content: string,
      input?: {
        label?: string;
        name?: string;
        options?: object;
      },
      options?: {
        buttons?: string;
        userId?: string;
      }
    ): Promise<object>;

    selectTargetDialog(
      title: string,
      content: string,
      targets: Token[],
      options?: {
        type?: string;
        selectOptions?: never[];
        skipDeadAndUnconscious?: boolean;
        coverToken?: undefined;
        reverseCover?: boolean;
        displayDistance?: boolean;
        maxAmount?: number;
        minAmount?: number;
        userId?: string;
        buttons?: string;
        maxes?: {};
      }
    ): Promise<false | object[]>;

    confirm(
      title: string,
      content: string,
      options?: {
        userId?: string;
        buttons?: string;
      }
    ): Promise<boolean>;

    confirmUseItem(
      item: Item,
      options?: {
        userId?: string;
        buttons?: string;
      }
    ): Promise<boolean>;

    selectDocumentDialog(
      title: string,
      content: string,
      documentType: string,
      options?: {
        displayTooltops?: boolean;
        sortAlphabetical?: boolean;
        sortCR?: boolean;
        userId?: string;
        addNoneDocument?: boolean;
        showCR?: boolean;
        showSpellLevel?: boolean;
        showUses?: boolean;
        displayReference?: boolean;
      }
    ): Promise<object>;

    selectDocumentsDialog(
      title: string,
      content: string,
      documents: object[],
      options?: {
        max?: undefined;
        displayTooltips?: boolean;
        sortAlphabetical?: boolean;
        sortCR?: boolean;
        userId?: string;
        showCR?: boolean;
        showSpellLevel?: boolean;
        showUses?: boolean;
        checkbox?: boolean;
        weights?: {};
        maxes?: {};
      }
    ): Promise<object[]>;

    selectHitDie(
      actor: Actor,
      title: string,
      content: string,
      options?: {
        max?: number;
        userId?: string;
        sangromancy?: boolean;
      }
    ): Promise<false | object[]>;

    selectSpellSlot(
      actor: Actor,
      title: string,
      content: string,
      options?: {
        maxLevel?: number;
        minLevel?: number;
        no?: boolean;
        userId?: string;
      }
    ): Promise<object>;

    selectDamageType(
      damageTypes: string[],
      title: string,
      context: string,
      options?: {
        addNo?: boolean;
        userId?: string;
      }
    ): Promise<string>;

    queuedConfirmDialog(
      title: any,
      content: any,
      options?: {
        actor?: Actor;
        reason?: string;
        userId?: string;
      }
    ): Promise<object>;

    selectDie(
      rolls: object[],
      title: string,
      content: string,
      options?: {
        max?: number;
        userId?: string;
        buttons?: string;
      }
    ): Promise<object>;
  }
}