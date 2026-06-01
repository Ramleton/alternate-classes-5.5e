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
    ): any | null;

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
      formula: string,
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
        multiplier?: number;
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
        options?: { image?: string; displayAsRows?: boolean },
      ][],
      options?: {
        userId?: string;
      }
    ): Promise<string>;

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
  };

  export const genericUtils: {
    sleep(ms: number): Promise<void>;
    translate(key: string): string;
    format(key: string, obj: object): string;
    setProperty(object: object, key: string, value: any): void;
    getProperty(object: object, key: string): any;
    duplicate(object: any): any;
    deepClone(object: object): object;
    mergeObject(original: object, other: object, options: object): object;
    update(
      entity: object,
      updates: object,
      options?: object,
      forceGM?: boolean
    ): Promise<void>;
    setFlag(
      entity: object,
      scope: string,
      key: string,
      value: any,
    ): Promise<void>;
    unsetFlag(entity: object, scope: string, key: string): Promise<void>;
    remove(entity: object): Promise<void>;
    decimalToFraction(decimal: number): string;
    getCPRSetting(key: string): object;
    setCPRSetting(key: string, value: any): Promise<void>;
    createUpdateSetting({ key: string, value: any }): Promise<void>;
    isNewerVersion(v1: string, v0: string): boolean;
    randomID(value: any): string;
    checkMedkitPermission(
      permission:
        | 'update'
        | 'automate'
        | 'configure'
        | 'homebrew',
      userId: string
    ): boolean | undefined;
    notify(
      message: string,
      type: string,
      options?: {
        localize?: boolean;
        permanent?: boolean;
      }
    ): void;
    createEmbeddedDocuments(
      entity: object,
      type: string,
      updates: object,
      options: object
    ): Promise<object>;
    updateEmbeddedDocuments(
      entity: object,
      type: string,
      updates: object,
      options: object
    ): Promise<object>;
    deleteEmbeddedDocuments(
      entity: object,
      type: string,
      options: object
    ): Promise<object>;
    updateTargets(targets: Token[], user: any): Promise<void>;
    collapseObjects(...objects: object[]): object;
    log(type: string, message: string): void;
    titleCase(inputString: string): string;
    camelCaseToWords(inputString: string): string;
    getIdentifier(inputString: string): string;
    checkPlayerOwnership(entity: object): boolean;
    getRules(entity: object): 'modern' | 'legacy' | string;
    getCPRIdentifier(
      name: string,
      rules?: 'modern' | 'legacy' | string
    ): string;
    getCPRIdentifiers(
      name: string,
      rules?: 'modern' | 'legacy' | string
    ): string[];
    convertDistance(ft: number): number;
  };

  export const socketUtils: {
    gmID(): string;
    isTheGM(): boolean;
    hasPermission(entity: any, userId: string): boolean;
    firstOwner(document: any, useId?: boolean): string | any;
    remoteRollItem(
      item: Item.Implementation,
      config: object,
      options: object,
      userId: string
    ): Promise<void>;
  };

  export const itemUtils: {
    getSaveDC(item: Item.Implementation): number;
    createItems(
      actor: Actor.Implementation,
      updates: object[],
      options?: {
        favorite?: boolean;
        section?: string;
        parentEntity?: object;
        identifier?: string;
        castData?: object;
      }
    );
    getItemDescription(name: string): string;
    isSpellFeature(item: Item.Implementation): boolean;
    getConfig(item: Item.Implementation, key: string): any;
    setConfig(
      item: Item.Implementation,
      key: string,
      value: any
    ): Promise<void>;
    getItemByIdentifier(
      actor: Actor.Implementation,
      identifier: string
    ): Item.Implementation;
    getAllItemsByIdentifier(
      actor: Actor.Implementation,
      identifier: string
    ): Item.Implementation[];
    getVersion(item: Item.Implementation): string | undefined;
    getSource(item: Item.Implementation): string | undefined;
    isUpToDate(item: Item.Implementation): Promise<boolean>;
    syntheticItem(
      itemData: Item,
      actor: Actor.Implementation
    ): Item.Implementation;
    enchantItem(
      item: Item.Implementation,
      effectData: ActiveEffect,
      options?: {
        effects?: ActiveEffect[];
        items?: Item.Implementation[];
        concentrationItem?: Item;
        parentEntity?: object;
        identifier?: string;
        vae?: boolean;
        interdependent?: boolean;
        strictlyInterdependent?: boolean;
      }
    );
    convertDuration(entity: any): any;
    getEquipmentState(item: Item.Implementation): boolean;
    getToolProficiency(
      actor: Actor.Implementation,
      tool: Item.Implementation
    ): 0 | 0.5 | 1 | 2;
    getSavedCastData(item: Item.Implementation): any;
    getGenericFeatureConfig(item: Item.Implementation, key: string): any;
    getItemByGenericFeature(actor: Actor.Implementation, key: string): any;
    isWeaponProficient(item: Item.Implementation): boolean;
    itemUpdate(item: Item.Implementation): Promise<Item.Implementation>;
    setHiddenActivities(
      item: Item.Implementation,
      activityIdentifiers: string[],
      replace?: boolean
    ): Promise<void>;
    setSpellActivities(
      item: Item.Implementation,
      activityIdentifiers: string[],
      replace?: boolean
    ): Promise<void>;
    getHiddenActivities(item: Item.Implementation): string[];
    getSpellActivities(item: Item.Implementation): string[];
    getActivity(item: Item.Implementation, type: string): any;
    getEffectByIdentifier(item: Item.Implementation, identifier: string): any;
    cloneItem(
      item: Item.Implementation,
      updates?: object,
      options?: {
        keepId?: boolean;
      }
    ): Item.Implementation;
    correctActivityItemConsumption(
      item: Item.Implementation,
      activityIdentifiers: string[],
      targetIdentifier: string
    ): Promise<void>;
    multiCorrectActivityItemConsumption(
      item: Item.Implementation,
      activityIdentifiers: string[],
      corrections: object
    ): Promise<void>;
    fixScales(item: Item.Implementation): Promise<void>;
    canUse(item: Item.Implementation): boolean;
  };

  export const tokenUtils: {
    getDistance(
      sourceToken: Token,
      targetToken: Token,
      options?: {
        wallsBlock?: boolean;
        checkCover?: boolean;
      }
    ): number;
    checkCollision(token: Token, ray: foundry.canvas.geometry.Ray): boolean;
    moveTokenAlongRay(
      targetToken: Token,
      origRay: foundry.canvas.geometry.Ray,
      distance: number
    ): Promise<void>;
    pushToken(
      sourceToken: Token,
      targetToken: Token,
      distance: number
    ): Promise<void>;
    findNearby(
      token: Token,
      range: number,
      disposition: 'ally' | 'neutral' | 'enemy',
      options?: {
        includeIncapacitated?: boolean;
        includeToken?: boolean;
      }
    ): Token[];
    checkIncapacitated(token: Token, logResult?: boolean): boolean;
    checkForRoom(token: Token, gridSquares: number): object;
    findDirection(room: object): string;
    canSee(sourceToken: Token, targetToken: Token): boolean;
    canSense(
      sourceToken: Token,
      targetToken: Token,
      senseModes: string[]
    ): boolean;
    attachToToken(token: Token, uuidsToAttach: string[]): Promise<void>;
    detachFromToken(token: Token, uuidsToDetatch: string[]): Promise<void>;
    getLightLevel(token: Token): string;
    grappleHelper(
      sourceToken: Token,
      targetToken: Token,
      item: Item,
      options?: {
        noContest?: boolean;
        flatDC?: boolean;
        escapeDisadvantage?: boolean;
        sourceEffect: ActiveEffect;
        targetEffect: ActiveEffect;
        restrained?: boolean;
        ignoreSizeLimit?: boolean;
      }
    );
    isGrappledBy(target: Token, source: Token): boolean;
    getMovementHitTokens(
      startPoint: { x: number; y: number },
      endPoint: { x: number; y: number },
      radius: number
    );
    getLinearDistanceMoved(token: Token): number;
    mountToken(
      rider: Token,
      target: Token,
      options?: {
        vae?: boolean;
        unhideActivities?: boolean;
      }
    );
    getBaseActor(token: Token): Actor;
  };

  export const constants: {
    attacks: ['msak', 'rsak', 'mwak', 'rwak'];
    meleeAttacks: ['mwak', 'msak'];
    rangedAttacks: ['rwak', 'rsak'];
    weaponAttacks: ['mwak', 'rwak'];
    spellAttacks: ['msak', 'rsak'];
    rangedWeaponAttacks: ['rwak'];
    meleeWeaponAttacks: ['mwak'];
    unarmedAttacks: [
      'unarmedStrike',
      'monkUnarmedStrike',
      'tavernBrawlerUnarmedStrike',
      'fightingStyleUnarmedFightingUnarmedStrike',
      'predatoryStrike',
      'unarmedFightingUnarmedStrike',
      'formOfTheBeast',
      'pugilistUnarmedStrike',
    ];
    weaponTypes: [
      'martialM',
      'simpleM',
      'martialR',
      'simpleR',
    ];
    meleeWeaponTypes: [
      'martialM',
      'simpleM',
    ];
    rangedWeaponTypes: [
      'martialR',
      'simpleR',
    ];
    armorTypes: [
      'light',
      'medium',
      'heavy',
    ];
    autoOptions: () => { label: string; value: string }[];
    damageTypeOptions: () => { label: string; value: string }[];
    creatureTypeOptions: () => { label: string; value: string }[];
    actorCompendiumPacks: () => { label: string; value: string }[];
    itemCompendiumPacks: () => { label: string; value: string }[];
    abilityOptions: () => { label: string; value: string }[];
    healingTypeOptions: () => { label: string; value: string }[];
    statusOptions: () => { label: string; value: string }[];
    skillOptions: () => { label: string; value: string }[];
    diceSizeOptions: () => { label: string; value: string }[];
    teleportOptions: () => { label: string; value: string }[];
    itemProperties: () => { label: string; value: string }[];
    itemOptions: () => { label: string; value: string }[];
    armorOptions: () => { label: string; value: string }[];
    spellSlotOptions: () => { label: string; value: string }[];
    spellSchoolOptions: () => { label: string; value: string }[];
    baseWeaponOptions: [];
    baseMeleeWeaponOptions: [];
    baseRangedWeaponOptions: [];
    getBaseWeaponOptions: () => [];
    getBaseMeleeWeaponOptions: () => [];
    getBaseRangedWeaponOptions: () => [];
    toolNames: object;
    featOptions: [];
  };
}
