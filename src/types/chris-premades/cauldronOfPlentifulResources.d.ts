import DamageType from '../damage.js';
import MidiActiveEffect from '../macro.js';
import { CPRMacro, D20Roll } from './macro.js';
import Summons from './summons.js';
import Teleport from './teleport.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface CauldronOfPlentifulResources {
  Summons: typeof Summons;
  Teleport: typeof Teleport;
  utils: {
    activityUtils: {
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
        options?: { strict?: boolean },
      ): any | null;

      getIdentifier(activity: object): string | null;

      setIdentifier(activity: object, identifier: string): Promise<void>;

      withChangedDamage(
        activity: object,
        formulaOrObj: string | DamageFormulaObject,
        types?: string[],
        options?: { specificIndex?: 0 },
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

    actorUtils: {
      getEffects(
        actor: Actor,
        options?: { includeItemEffects?: boolean },
      ): ActiveEffect[];
      addFavorites(actor: Actor, entities: any[]): Promise<void>;
      removeFavorites(actor: Actor, entities: any[]): Promise<void>;
      getTokens(actor: Actor): Token[];
      getFirstToken(actor: Actor5e): Token;
      getLevelOrCR(actor: Actor): number;
      checkTrait(actor: Actor, type: string, trait: string): boolean;
      typeOrRace(actor: Actor): string;
      raceOrType(actor: Actor): string;
      getAlignment(actor: Actor): string;
      getCRFromProf(prof: number): number;
      getSidebarActor(actor: Actor, options?: { autoImport?: boolean }): Actor;
      getSize<B extends boolean>(
        actor: Actor5e,
        returnString: B,
      ): B extends true ? string : number;
      hasUsedReaction(actor: Actor5e): boolean;
      setReactionUsed(actor: Actor5e): Promise<void>;
      removeReactionUsed(actor: Actor5e, force?: boolean): Promise<void>;
      hasUsedBonusAction(actor: Actor5e): boolean;
      setBonusActionUsed(actor: Actor5e): Promise<void>;
      removeBonusActionUsed(actor: Actor5e, force?: boolean): Promise<void>;
      hasSpellSlots(actor: Actor5e, atLeast?: number): boolean;
      getCastableSpells(actor: Actor5e): Item[];
      isShapeChanger(actor: Actor5e): boolean;
      doConcentrationCheck(actor: Actor5e, saveDC: number): Promise<void>;
      polymorph(
        origActor: Actor5e,
        newActor: Actor5e,
        options: object,
        renderSheet?: boolean,
      ): Promise<void>;
      updateAll(actor: Actor5e): Promise<string>;
      getEquivalentSpellSlotName(
        actor: Actor5e,
        level: number,
        options?: {
          canCast?: boolean;
        },
      );
      getEquippedArmor(actor: Actor5e, types?: string[]): Item?;
      getEquippedShield(actor: Actor5e): Item?;
      getAllEquippedArmor(actor: Actor5e): Item[];
      hasConditionBy(
        sourceActor: Actor5e,
        targetActor: Actor5e,
        statusId: string,
      ): Promise<boolean>;
      compareSize(
        source: Actor5e | Token,
        target: Actor5e | Token,
        goal:
          | 'equal'
          | '='
          | '==='
          | 'greaterThan'
          | '>'
          | 'greaterThanOrEqualTo'
          | '>='
          | 'lessThan'
          | '<'
          | 'lessThanOrEqualTo'
          | '<=',
      ): boolean;
      getBestAbility(actor: Actor, abilities: string[]): string;
      giveHeroicInspiration(actor: Actor): Promise<void>;
    };

    constants: {
      summonAnimationOptions: [
        {
          value: 'default';
          label: 'CHRISPREMADES.Config.Animations.Default';
          requiredModules: ['jb2a_patreon', 'animated-spell-effects-cartoon'];
        },
        {
          value: 'celestial';
          label: 'CHRISPREMADES.Config.Animations.Celestial';
          requiredModules: ['jb2a_patreon', 'animated-spell-effects-cartoon'];
        },
        {
          value: 'fiend';
          label: 'CHRISPREMADES.Config.Animations.Fiend';
          requiredModules: ['jb2a_patreon', 'animated-spell-effects-cartoon'];
        },
        {
          value: 'fire';
          label: 'CHRISPREMADES.Config.Animations.Fire';
          requiredModules: ['jb2a_patreon'];
        },
        {
          value: 'water';
          label: 'CHRISPREMADES.Config.Animations.Water';
          requiredModules: ['jb2a_patreon'];
        },
        {
          value: 'air';
          label: 'CHRISPREMADES.Config.Animations.Air';
          requiredModules: ['jb2a_patreon', 'animated-spell-effects-cartoon'];
        },
        {
          value: 'earth';
          label: 'CHRISPREMADES.Config.Animations.Earth';
          requiredModules: ['jb2a_patreon', 'animated-spell-effects-cartoon'];
        },
        {
          value: 'nature';
          label: 'CHRISPREMADES.Config.Animations.Nature';
          requiredModules: ['jb2a_patreon'];
        },
        {
          value: 'shadow';
          label: 'CHRISPREMADES.Config.Animations.Shadow';
          requiredModules: ['jb2a_patreon'];
        },
        {
          value: 'smoke';
          label: 'CHRISPREMADES.Config.Animations.Smoke';
          requiredModules: [];
        },
        {
          value: 'future';
          label: 'CHRISPREMADES.Config.Animations.Future';
          requiredModules: ['jb2a_patreon'];
        },
        {
          value: 'none';
          label: 'CHRISPREMADES.Config.Animations.None';
          requiredModules: [];
        },
      ];
      tempConditionIcon: 'icons/magic/time/arrows-circling-green.webp';
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
      weaponTypes: ['martialM', 'simpleM', 'martialR', 'simpleR'];
      meleeWeaponTypes: ['martialM', 'simpleM'];
      rangedWeaponTypes: ['martialR', 'simpleR'];
      armorTypes: ['light', 'medium', 'heavy'];
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

    workflowUtils: {
      bonusDamage(
        workflow: Workflow,
        formula: string,
        options?: {
          ignoreCrit?: boolean;
          damageType?: DamageType;
        },
      ): Promise<void>;

      bonusAttack(workflow: Workflow, formula: string): Promise<void>;

      replaceDamage(
        workflow: Workflow,
        formula: string,
        options?: {
          ignoreCrit?: boolean;
          damageType?: DamageType;
        },
      ): Promise<void>;

      applyDamage(
        tokens: Token[],
        value: number,
        damageType: DAMAGE_TYPE,
      ): Promise<void>;

      completeActivityUse(
        activity: object,
        config?: object,
        dialog?: object,
        message?: object,
      ): Promise<Workflow>;

      completeItemUse(
        item: Item,
        config?: object,
        options?: object,
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
        },
      ): Promise<Workflow>;

      syntheticItemRoll(
        item: Item,
        targets: Token[],
        options?: {
          options?: object;
          config?: object;
          userId?: string;
          consumeUsage?: boolean;
          consumeResources?: boolean;
          spellSlot?: boolean;
        },
      ): Promise<Workflow>;

      syntheticItemDataRoll(
        itemData: Item,
        actor: Actor5e,
        targets: Token[],
        options?: {
          options?: object;
          config?: object;
          killAnim?: boolean;
        },
      ): Promise<Workflow>;

      syntheticActivityDataRoll(
        activityData: object,
        item: Item,
        actor: Actor5e,
        targets: Token[],
        options?: {
          options?: object;
          config?: object;
          atLevel?: number;
          consumeUsage?: boolean;
          consumeResources?: boolean;
        },
      ): Promise<Workflow>;

      negateDamageItemDamage(ditem: object): void;

      setDamageItemDamage(
        ditem: object,
        damageAmount: number,
        adjustRaw?: boolean,
      ): void;

      preventDeath(ditem: object): void;

      modifyDamageAppliedFlat(
        ditem: object,
        modificationAmount: number,
        options?: {
          type?: string;
          multiplier?: number;
        },
      ): void;

      applyWorkflowDamage(
        sourceToken: TokenDocument,
        damageRoll: object,
        damageType: string,
        targets: object[],
        options?: {
          flavor?: string;
          itemCardId?: string;
          sourceItem?: Item;
        },
      ): Workflow;

      getDamageTypes(damageRolls: object[]): Set<string>;

      getTotalDamageOfType(
        damageDetail: object,
        actor: Actor5e,
        type: string,
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
        },
      ): Promise<Workflow>;

      updateTargets(
        workflow: Workflow,
        targets: Token[],
        options?: { userId?: string },
      ): Promise<void>;

      removeTargets(
        workflow: Workflow,
        targets: Token[],
        options?: { userId: string },
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
          | 'meleeWeaponAttack',
      ): boolean;

      swapAttackAbility(
        workflow: Workflow,
        ability?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha',
        options?: {
          validTypes?: string[];
          checkHigher?: boolean;
        },
      ): Promise<void>;

      addEntityRemoval(
        workflow: unknown,
        entities: ActiveEffect[],
      ): Promise<void>;

      isSustainedRoll(workflow: Workflow): boolean;
    };

    effectUtils: {
      getCastData(effect: ActiveEffect): object;

      getCastLevel(effect: ActiveEffect): number | undefined;

      getBaseLevel(effect: ActiveEffect): number | undefined;

      setCastData(effect: ActiveEffect, data: object): Promise<void>;

      setCastLevel(effect: ActiveEffect, level: number): Promise<void>;

      setBaseLevel(effect: ActiveEffect, level: number): Promise<void>;

      getSaveDC(effect: ActiveEffect): number | undefined;

      setSaveDC(effect: ActiveEffect, level: number): Promise<void>;

      createEffect(
        actor: Actor5e,
        effectData: object,
        options?: {
          concentrationItem?: Item;
          parentEntity?: object;
          identifier?: string;
          vae?: boolean;
          interdependent?: boolean;
          strictlyInterdependent?: boolean;
          unhideActivities?: boolean;
          rules?: 'modern' | 'legacy';
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
        },
      ): Promise<ActiveEffect>;

      createEffects(
        entity: Actor,
        effectDataArray: object[],
        effectOptionsArray: object[],
      ): Promise<ActiveEffect[]>;

      addDependent(
        entity: object,
        dependents: object[],
        forceGM?: boolean,
      ): Promise<void>;

      addMacro(effectData: object, type: string, macroList: object): void;

      getConcentrationEffect(
        actor: Actor,
        concentrationItem: Item,
      ): ActiveEffect;

      getEffectByIdentifier(
        actor: Actor5e,
        name: string,
      ): ActiveEffect | undefined;

      getAllEffectsByIdentifier(
        actor: Actor,
        name: string,
      ): (ActiveEffect | undefined)[];

      getEffectByStatusID(actor: Actor, statusID: string): ActiveEffect;

      applyConditions(
        actor: Actor,
        conditions: string[],
        options?: {
          overlay?: boolean;
        },
      ): Promise<void>;

      sidebarEffectHelper(documentId: string, toggle: boolean): Promise<void>;

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
        },
      ): Promise<ActiveEffect>;

      syntheticActiveEffect(
        effectData: object,
        entity: object,
      ): Promise<ActiveEffect>;

      getOriginItem(effect: MidiActiveEffect): Promise<Item>;

      getOriginItemSync(effect: ActiveEffect): Item;

      getConditions(effect: ActiveEffect): Set<string>;
    };

    dialogUtils: {
      buttonDialog<T>(
        title: string,
        content: string,
        buttons: [
          string,
          T,
          options?: { image?: string; displayAsRows?: boolean },
        ][],
        options?: {
          userId?: string;
        },
      ): Promise<T>;

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
        },
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
        },
      ): Promise<object>;

      selectTargetDialog(
        title: string,
        content: string,
        targets: Token[],
        options?: {
          type?: 'multiple' | 'selectAmount';
          selectOptions?: never[];
          skipDeadAndUnconscious?: boolean;
          coverToken?: undefined;
          reverseCover?: boolean;
          displayDistance?: boolean;
          maxAmount?: number;
          minAmount?: number;
          userId?: string;
          buttons?: string;
          maxes?: any;
        },
      ): Promise<false | [Token[], boolean] | [Token, boolean] | Token>;

      confirm(
        title: string,
        content: string,
        options?: {
          userId?: string;
          buttons?: string;
        },
      ): Promise<boolean>;

      confirmUseItem(
        item: Item,
        options?: {
          userId?: string;
          buttons?: string;
        },
      ): Promise<boolean>;

      selectDocumentDialog(
        title: string,
        content: string,
        documents: any,
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
        },
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
          weights?: any;
          maxes?: any;
        },
      ): Promise<object[]>;

      selectHitDie(
        actor: Actor,
        title: string,
        content: string,
        options?: {
          max?: number;
          userId?: string;
          sangromancy?: boolean;
        },
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
        },
      ): Promise<object>;

      selectDamageType(
        damageTypes: string[],
        title: string,
        context: string,
        options?: {
          addNo?: boolean;
          userId?: string;
        },
      ): Promise<string>;

      queuedConfirmDialog(
        title: any,
        content: any,
        options?: {
          actor?: Actor;
          reason?: string;
          userId?: string;
        },
      ): Promise<object>;

      selectDie(
        rolls: object[],
        title: string,
        content: string,
        options?: {
          max?: number;
          userId?: string;
          buttons?: string;
        },
      ): Promise<object>;
    };

    genericUtils: {
      sleep(ms: number): Promise<void>;
      translate(key: string): string;
      format(key: string, obj: object): string;
      setProperty(object: object, key: string, value: any): void;
      getProperty(object: object, key: string): any;
      duplicate(object: any): any;
      deepClone<T>(object: T): T;
      mergeObject(original: object, other: object, options: object): object;
      update(
        entity: object,
        updates: object,
        options?: object,
        forceGM?: boolean,
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
        permission: 'update' | 'automate' | 'configure' | 'homebrew',
        userId: string,
      ): boolean | undefined;
      notify(
        message: string,
        type: string,
        options?: {
          localize?: boolean;
          permanent?: boolean;
        },
      ): void;
      createEmbeddedDocuments(
        entity: object,
        type: string,
        updates: object,
        options: object,
      ): Promise<object>;
      updateEmbeddedDocuments(
        entity: object,
        type: string,
        updates: object,
        options: object,
      ): Promise<object>;
      deleteEmbeddedDocuments(
        entity: object,
        type: string,
        options: object,
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
        rules?: 'modern' | 'legacy' | string,
      ): string;
      getCPRIdentifiers(
        name: string,
        rules?: 'modern' | 'legacy' | string,
      ): string[];
      convertDistance(ft: number): number;
    };

    socketUtils: {
      gmID(): string;
      isTheGM(): boolean;
      hasPermission(entity: any, userId: string): boolean;
      firstOwner(document: any, useId?: boolean): string | any;
      remoteRollItem(
        item: Item.Implementation,
        config: object,
        options: object,
        userId: string,
      ): Promise<void>;
    };

    itemUtils: {
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
        },
      ): Promise<Item[]>;
      getItemDescription(name: string): string;
      isSpellFeature(item: Item.Implementation): boolean;
      getConfig(item: Item.Implementation, key: string): any;
      setConfig(
        item: Item.Implementation,
        key: string,
        value: any,
      ): Promise<void>;
      getItemByIdentifier<T extends Item.SubType>(
        actor: Actor.Implementation,
        identifier: string,
      ): Item.OfType<T> | undefined;
      getAllItemsByIdentifier(
        actor: Actor.Implementation,
        identifier: string,
      ): Item.Implementation[];
      getVersion(item: Item.Implementation): string | undefined;
      getSource(item: Item.Implementation): string | undefined;
      isUpToDate(item: Item.Implementation): Promise<boolean>;
      syntheticItem(
        itemData: Item,
        actor: Actor.Implementation,
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
        },
      );
      convertDuration(entity: any): any;
      getEquipmentState(item: Item.Implementation): boolean;
      getToolProficiency(
        actor: Actor.Implementation,
        tool: Item.Implementation,
      ): 0 | 0.5 | 1 | 2;
      getSavedCastData(item: Item.Implementation): any;
      getGenericFeatureConfig(item: Item.Implementation, key: string): any;
      getItemByGenericFeature(actor: Actor.Implementation, key: string): any;
      isWeaponProficient(item: Item.Implementation): boolean;
      itemUpdate(item: Item.Implementation): Promise<Item.Implementation>;
      setHiddenActivities(
        item: Item.Implementation,
        activityIdentifiers: string[],
        replace?: boolean,
      ): Promise<void>;
      setSpellActivities(
        item: Item.Implementation,
        activityIdentifiers: string[],
        replace?: boolean,
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
        },
      ): Item.Implementation;
      correctActivityItemConsumption(
        item: Item.Implementation,
        activityIdentifiers: string[],
        targetIdentifier: string,
      ): Promise<void>;
      multiCorrectActivityItemConsumption(
        item: Item.Implementation,
        activityIdentifiers: string[],
        corrections: object,
      ): Promise<void>;
      fixScales(item: Item.Implementation): Promise<void>;
      canUse(item: Item.Implementation): boolean;
    };

    tokenUtils: {
      getDistance(
        sourceToken: Token,
        targetToken: Token,
        options?: {
          wallsBlock?: boolean;
          checkCover?: boolean;
        },
      ): number;
      checkCollision(token: Token, ray: foundry.canvas.geometry.Ray): boolean;
      moveTokenAlongRay(
        targetToken: Token,
        origRay: foundry.canvas.geometry.Ray,
        distance: number,
      ): Promise<void>;
      pushToken(
        sourceToken: Token,
        targetToken: Token,
        distance: number,
      ): Promise<void>;
      findNearby(
        token: Token,
        range: number,
        disposition: 'ally' | 'neutral' | 'enemy' | 'any',
        options?: {
          includeIncapacitated?: boolean;
          includeToken?: boolean;
        },
      ): Token[];
      checkIncapacitated(token: Token, logResult?: boolean): boolean;
      checkForRoom(token: Token, gridSquares: number): object;
      findDirection(room: object): string;
      canSee(sourceToken: Token, targetToken: Token): boolean;
      canSense(
        sourceToken: Token,
        targetToken: Token,
        senseModes: string[],
      ): boolean;
      attachToToken(token: Token, uuidsToAttach: string[]): Promise<void>;
      detachFromToken(token: Token, uuidsToDetatch: string[]): Promise<void>;
      getLightLevel(token: Token): 'bright' | 'dim' | 'dark';
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
        },
      );
      isGrappledBy(target: Token, source: Token): boolean;
      getMovementHitTokens(
        startPoint: { x: number; y: number },
        endPoint: { x: number; y: number },
        radius: number,
      );
      getLinearDistanceMoved(token: Token): number;
      mountToken(
        rider: Token,
        target: Token,
        options?: {
          vae?: boolean;
          unhideActivities?: boolean;
        },
      );
      getBaseActor(token: Token): Actor;
    };

    rollUtils: {
      getCriticalFormula(formula: string, rollData: any): any;
      contestedRoll({
        sourceToken,
        targetToken,
        sourceRollType,
        targetRollType,
        sourceAbilities,
        targetAbilities,
        sourceRollOptions,
        targetRollOptions,
      }: {
        sourceToken: Token;
        targetToken: Token;
        sourceRollType: string;
        targetRollType: string;
        sourceAbilities: string[];
        targetAbilities: string[];
        sourceRollOptions?: any;
        targetRollOptions?: any;
      }): Promise<any>;
      requestRoll(
        token: Token,
        request: string,
        ability: string,
        options?: any,
      ): Promise<any>;
      getChangedDamageRoll(origRoll, newType): Promise<any>;
      rollDice(
        formula: string,
        options?: {
          entity?: any;
          chatMessage?: boolean;
          flavor?: any;
          mode?: 'publicroll' | 'gmroll' | 'blindroll' | 'selfroll';
          options?: any;
        },
      ): Promise<any>;
      rollDiceSync(
        formula: string,
        options?: {
          entity?: any;
          options?: {
            strict?: boolean;
            maximize?: boolean;
            minimize?: boolean;
          };
        },
      );
      damageRoll(
        formula: string,
        entity: any,
        options?: any,
        evaluateOptions?: any,
      ): Promise<any>;
      addToRoll(
        roll: D20Roll,
        formula: string,
        options?: { rollData?: D20Roll },
      ): Promise<D20Roll>;
      remoteRoll(roll: any, userId: any): Promise<any>;
      remoteDamageRolls(rolls: any, userId: any): Promise<any>;
      hasDuplicateDie(rolls: any[]): boolean;
      replaceD20(roll: any, number: any): Promise<any>;
      makeCritical(roll: any): Promise<any>;
      updateDieResult(
        roll: any,
        termIndex: number,
        resultIndex: number,
        newValue: any,
      ): void;
    };

    combatUtils: {
      currentTurn(): `${number} - ${number}`;
      inCombat(): boolean;
      combatStarted(): boolean;
      perTurnCheck(
        entity: any,
        name: string,
        ownTurnOnly: boolean,
        tokenId: string,
      ): boolean;
      setTurnCheck(entity: any, name: string, reset: boolean): Promise<void>;
      getCurrentCombatantToken(): Token;
      isOwnTurn(token: Token): boolean;
    };

    actorUtils: {
      getEffects(
        actor: Actor,
        options?: { includeItemEffects?: boolean },
      ): ActiveEffect[];
      addFavorites(actor: Actor, entities: any[]): Promise<void>;
      removeFavorites(actor: Actor, entities: any[]): Promise<void>;
      getTokens(actor: Actor): Token[];
      getFirstToken(actor: Actor): Token;
      getLevelOrCR(actor: Actor): number;
      checkTrait(actor: Actor, type: string, trait: string): boolean;
      typeOrRace(actor: Actor): string;
      raceOrType(actor: Actor): string;
      getAlignment(actor: Actor): string;
      getCRFromProf(prof: number): number;
      getSidebarActor(actor: Actor, options?: { autoImport?: boolean }): Actor;
      getSize<B extends boolean>(
        actor: Actor,
        returnString: B,
      ): B extends true ? string : number;
      hasUsedReaction(actor: Actor): boolean;
      setReactionUsed(actor: Actor): Promise<void>;
      removeReactionUsed(actor: Actor, force?: boolean): Promise<void>;
      hasUsedBonusAction(actor: Actor): boolean;
      setBonusActionUsed(actor: Actor): Promise<void>;
      removeBonusActionUsed(actor: Actor, force?: boolean): Promise<void>;
      hasSpellSlots(actor: Actor, atLeast?: number): boolean;
      getCastableSpells(actor: Actor): Item[];
      isShapeChanger(actor: Actor): boolean;
      doConcentrationCheck(actor: Actor, saveDC: number): Promise<void>;
      polymorph(
        origActor: Actor,
        newActor: Actor,
        options: object,
        renderSheet?: boolean,
      ): Promise<void>;
      updateAll(actor: Actor): Promise<string>;
      getEquivalentSpellSlotName(
        actor: Actor,
        level: number,
        options?: {
          canCast?: boolean;
        },
      );
      getEquippedArmor(actor: Actor, types?: string[]): Item?;
      getEquippedShield(actor: Actor): Item?;
      getAllEquippedArmor(actor: Actor): Item[];
      hasConditionBy(
        sourceActor: Actor,
        targetActor: Actor,
        statusId: string,
      ): Promise<boolean>;
      compareSize(
        source: Actor | Token,
        target: Actor | Token,
        goal:
          | 'equal'
          | '='
          | '==='
          | 'greaterThan'
          | '>'
          | 'greaterThanOrEqualTo'
          | '>='
          | 'lessThan'
          | '<'
          | 'lessThanOrEqualTo'
          | '<=',
      ): boolean;
      getBestAbility(actor: Actor, abilities: string[]): string;
      giveHeroicInspiration(actor: Actor): Promise<void>;
    };

    thirdPartyUtils: {
      attacked(
        workflow: Workflow,
        itemIdentifier: string,
        activityIdentifier: string,
        options: {
          canSee?: boolean;
          reaction?: boolean;
          distance?: number;
          canUse?: boolean;
          attacker?: boolean;
          dispositionType?: 'ally' | 'neutral' | 'enemy' | 'any';
          dialogType?: 'use' | 'attackRoll';
          creatureTypes?: string[];
          isOwner?: boolean;
        },
      );
      damaged(
        workflow: Workflow,
        ditem: any,
        targetToken: any,
        itemIdentifier: string,
        activityIdentifier: string,
        options?: {
          canSee?: boolean;
          reaction?: boolean;
          distance?: number;
          canUse?: boolean;
          dispositionType?: 'ally' | 'neutral' | 'enemy' | 'any';
          dialogType?: 'use' | 'attackRoll';
          checkHits?: boolean;
          preventZeroHP?: boolean;
          halfDamage?: boolean;
        },
      );
    };

    compendiumUtils: {
      getCPRAutomation(
        item,
        options?: {
          identifier?: string;
          rules?: 'modern' | 'legacy';
          type?: 'character' | 'spell' | 'npc';
        },
      );
      getGPSAutomation(
        item,
        options?: {
          identifier?: string;
          rules?: 'modern' | 'legacy';
          type?: 'character' | 'spell' | 'npc';
        },
      );
      getMISCAutomation(
        item,
        options?: {
          identifier?: string;
          rules?: 'modern' | 'legacy';
          type?: 'character' | 'spell' | 'npc';
        },
      );

      getACCAutomation(
        item,
        options?: {
          identifier?: string;
          rules?: 'modern' | 'legacy';
          type?: 'character' | 'spell' | 'npc';
        },
      );
      getAllAutomations(
        item,
        options?: {
          identifier?: string;
          rules?: 'modern' | 'legacy';
          type?: 'character' | 'spell' | 'npc';
        },
      );
      getPreferredAutomation(
        item,
        options?: {
          identifier?: string;
          rules?: 'modern' | 'legacy';
          type?: 'character' | 'spell' | 'npc';
        },
      );
      getItemFromCompendium(
        key: string,
        name: string,
        options?: {
          ignoreNotFound?: boolean;
          folderId?: string;
          object?: boolean;
          getDescription?: boolean;
          translate?: boolean;
          flatAttack?: number;
          flatDC?: number;
          castDataWorkflow?: Workflow;
          matchType?: string;
          rules?: 'modern' | 'legacy';
          byIdentifier?: boolean;
          bySystemIdentifier?: boolean;
        },
      );
      getActorFromCompendium(
        key: string,
        name: string,
        options?: {
          ignoreNotFound?: boolean;
          folderId?: string;
          object?: boolean;
          translate?: boolean;
          identifier?: string;
        },
      );
      getFilteredActorDocumentsFromCompendium(
        key: string,
        options?: {
          maxCR: number;
          actorTypes: string[];
          creatureTypes: string[];
          creatureSubtypes: string[];
          specificNames: string[];
        },
      );
      getFilteredItemDocumentsFromCompendium(
        key: string,
        options?: {
          specificNames: string[];
          types: string[];
          typeValues: string[];
          badProperties: string[];
        },
      );
      getAppliedOrPreferredAutomation(
        item,
        options?: {
          identifier?: string;
          rules?: 'modern' | 'legacy';
          type?: 'character' | 'spell' | 'npc';
        },
      );
    };

    macroUtils: {
      registerMacros(macros: CPRMacro[]): void;
    };

    templateUtils: {
      getTokensInShape(
        shape: any,
        scene: any,
        { x: offsetX, y: offsetY }: { x: number; y: number },
      ): Token[];
      getTokensInTemplate(template): Set<Token>;
      getTemplatesInToken(token): Template[];
      getTokenPoints(token): { x: number; y: number }[];
      findGrids(A: any, B: any, template: Template): Set<any>;
      getCastData(template): any;
      getCastLevel(template): number;
      getBaseLevel(template): number;
      setCastData(template: Template, data: any): Promise<void>;
      setCastLevel(template: Template, level: number): Promise<void>;
      setBaseLevel(template: Template, level: number): Promise<void>;
      getSaveDC(template: Template): number | undefined;
      setSaveDC(template: Template, dc: number): Promise<void>;
      getName(template: Template): string;
      setName(template: Template, name: string): Promise<void>;
      placeTemplate(
        templateData: any,
        returnTokens?: boolean,
      ): Promise<Template | { template: Template; tokens: Set<Token> }>;
      rayIntersectsTemplate(templateDoc: any, ray: any): boolean;
      getIntersections(
        templateObj: any,
        A: any,
        B: any,
        boolOnly?: boolean,
      ): any;
      getSourceActor(template: Template): Promise<Actor | undefined>;
      overlap(template1: Template, template2: Template): boolean;
      attachToTemplate(
        template: Template,
        uuidsToAttach: string[],
      ): Promise<void>;
    };
  };
}
