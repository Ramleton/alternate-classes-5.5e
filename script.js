Hooks.once('init', () => {
  // Adds the class feature types from LaserLlama's Alternate Classes
  CONFIG.DND5E.featureTypes.class.subtypes.knack = 'Knack';
  CONFIG.DND5E.featureTypes.class.subtypes.deviousExploit = 'Devious Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.savageExploit = 'Savage Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.martialExploit = 'Martial Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.mysticTechnique = 'Mystic Technique';
  CONFIG.DND5E.featureTypes.class.subtypes.enchantedShot = 'Enchanted Shot';
  console.log('Alternate Classes 5e | Initialized class feature types');

  class WuJenSpellcasting extends dnd5e
    .dataModels
    .spellcasting
    .SingleLevelSpellcasting {
    /** @override */
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    static get TYPE() {
      return 'wuJen';
    }
  }

  dnd5e.dataModels.spellcasting.SpellcastingModel.TYPES.wuJen
    = WuJenSpellcasting;

  CONFIG.DND5E.spellcastingTypes.wuJen = WuJenSpellcasting;

  // Add the Wu Jen Spellcasting type
  CONFIG.DND5E.spellcasting.wuJen = {
    label: 'Wu Jen Spellcasting',
    type: 'single',
    order: 15,
    cantrips: true,
    prepares: false,
    img: 'icons/magic/air/air-smoke-casting.webp',
    table: {
      3: { slots: 1, level: 1 },
      4: { slots: 2, level: 1 },
      7: { slots: 2, level: 2 },
      13: { slots: 2, level: 3 },
      19: { slots: 2, level: 4 },
    },
    progression: {
      wuJen: {
        label: 'Wu Jen Spellcasting',
        divisor: 1,
        roundUp: true,
      },
    },
    exclusive: {
      slots: false,
      spells: false,
    },
  };
  console.log('Alternate Classes 5e | Initialized Wu Jen Spellcasting');

  /**
   * Add Rest Recovery for Alternate Classes Spellcasting Types
   */
  CONFIG.DND5E.restTypes.short.recoverSpellSlotTypes.add('wuJen');
  CONFIG.DND5E.restTypes.long.recoverSpellSlotTypes.add('wuJen');
  console.log('Alternate Classes 5e | \
    Initialized rest recovery for Alternate Classes spellcasting types');

  /**
   * API for Alternate Classes 5e
   */
  game.modules.get('alternate-classes-55e').api = {
    isMartialArtsAttack: function ({ workflow }) {
      const { utils: { itemUtils, workflowUtils } } = chrisPremades;
      if (!workflowUtils.isAttackType(workflow, 'attack')) return false;
      const signatureWeapon = itemUtils
        .getEffectByIdentifier(
          workflow.item,
          'ac55eSignatureWeapon',
        );
      if (signatureWeapon) return true;
      const martialArts = itemUtils.getEffectByIdentifier(
        workflow.item,
        'ac55eMartialArtsEnchantment',
      );
      if (!martialArts) return false;
      return true;
    },

    isMeleeMartialArtsAttack: function ({ workflow }) {
      const { utils: { workflowUtils } } = chrisPremades;
      const radiantBolt = workflow
        .item
        ?.flags
        ?.['chris-premades']
        ?.info
        ?.identifier === 'ac55eRadiantBolt';
      if (radiantBolt) return true;
      if (workflowUtils.getActionType(workflow) !== 'mwak') return false;
      return game
        .modules
        .get('alternate-classes-55e')
        .api
        .isMartialArtsAttack({ workflow });
    },

    getAlternateMartialExploits: function (actor) {
      const { utils: { itemUtils } } = chrisPremades;
      const martialExploits = itemUtils.getItemByIdentifier(
        actor,
        'martialExploits',
      );
      const savageExploits = itemUtils.getItemByIdentifier(
        actor,
        'savageExploits',
      );
      const deviousExploits = itemUtils.getItemByIdentifier(
        actor,
        'deviousExploits',
      );
      return {
        martialExploits,
        savageExploits,
        deviousExploits,
      };
    },

    alternateMartialExploitMulticlassingTable: [
      { totalLevel: 1, exploitDie: 'd4', exploitDice: 2 },
      { totalLevel: 2, exploitDie: 'd4', exploitDice: 2 },
      { totalLevel: 3, exploitDie: 'd4', exploitDice: 2 },
      { totalLevel: 4, exploitDie: 'd4', exploitDice: 2 },
      { totalLevel: 5, exploitDie: 'd6', exploitDice: 3 },
      { totalLevel: 6, exploitDie: 'd6', exploitDice: 3 },
      { totalLevel: 7, exploitDie: 'd6', exploitDice: 3 },
      { totalLevel: 8, exploitDie: 'd6', exploitDice: 3 },
      { totalLevel: 9, exploitDie: 'd6', exploitDice: 3 },
      { totalLevel: 10, exploitDie: 'd6', exploitDice: 3 },
      { totalLevel: 11, exploitDie: 'd8', exploitDice: 4 },
      { totalLevel: 12, exploitDie: 'd8', exploitDice: 4 },
      { totalLevel: 13, exploitDie: 'd8', exploitDice: 4 },
      { totalLevel: 14, exploitDie: 'd8', exploitDice: 4 },
      { totalLevel: 15, exploitDie: 'd8', exploitDice: 4 },
      { totalLevel: 16, exploitDie: 'd8', exploitDice: 4 },
      { totalLevel: 17, exploitDie: 'd10', exploitDice: 5 },
      { totalLevel: 18, exploitDie: 'd10', exploitDice: 5 },
      { totalLevel: 19, exploitDie: 'd10', exploitDice: 5 },
      { totalLevel: 20, exploitDie: 'd10', exploitDice: 5 },
    ],

    macroPassToExploit: {
      attackRollComplete: [
        'arresting-strike',
        'disarm',
        'ruthless-strike',
        'sweeping-strike',
        'concussive-blow',
        'crippling-strike',
        'rending-strike',
        'disorienting-blow',
        'staggering-blow',
      ],
      postAttackRoll: [
        'precision-strike',
        'martial-focus',
      ],
      targetAttackRollComplete: [
        'riposte',
        'redirect',
      ],
      targetApplyDamage: [
        'mythic-resilience',
        'unbreakable',
      ],
      targetDamageRollComplete: [
        'shield-impact',
      ],
    },

    exploitTypes: ['martialExploit', 'savageExploit', 'deviousExploit'],

    altMartialExploitsToDegrees: {
      // 1st Degree Exploits
      'arresting-strike': 1,
      'brace-up': 1,
      'disarm': 1,
      'feat-of-strength': 1,
      'feint': 1,
      'first-aid': 1,
      'heroic-fortitude': 1,
      'hurl': 1,
      'imposing-presence': 1,
      'mighty-leap': 1,
      'mighty-thrust': 1,
      'parry': 1,
      'precision-strike': 1,
      'riposte': 1,
      'ruthless-strike': 1,
      'shield-impact': 1,
      'skilled-rider': 1,
      'sweeping-strike': 1,
      // 2nd Degree Exploits
      'blinding-debris': 2,
      'concussive-blow': 2,
      'crippling-strike': 2,
      'defensive-stance': 2,
      'heroic-will': 2,
      'honor-duel': 2,
      'martial-focus': 2,
      'menacing-shout': 2,
      'redirect': 2,
      'rending-strike': 2,
      'volley': 2,
      'whirlwind-strike': 2,
      // 3rd Degree Exploits
      'disorienting-blow': 3,
      'heroic-focus': 3,
      'mighty-shot': 3,
      'mythic-athleticism': 3,
      'mythic-resilience': 3,
      'war-cry': 3,
      // 4th Degree Exploits
      'expert-focus': 4,
      'fluid-movements': 4,
      'quick-draw': 4,
      'staggering-blow': 4,
      'unbreakable': 4,
      // 5th Degree Exploits
      'steel-wind-slash': 5,
      'storm-of-arrows': 5,
    },

    alternateMartialExploitMulticlassingValues: function (totalLevel) {
      return game.modules.get('alternate-classes-55e').api.alternateMartialExploitMulticlassingTable[totalLevel - 1];
    },

    getAltMartialExploitDieForMulticlassLevel: function (totalLevel) {
      const formula = game.modules.get('alternate-classes-55e').api.alternateMartialExploitMulticlassingTable[totalLevel - 1].exploitDie;
      return { faces: Number.fromString(formula.replace('d', '')), formula };
    },

    getAltMartialMCTotalLevel: function (actor) {
      const fighterLevels = actor.items.filter(
        item => item.system.identifier === 'alternate-fighter',
      )[0]?.system?.levels || 0;
      const barbarianLevels = actor.items.filter(
        item => item.system.identifier === 'alternate-barbarian',
      )[0]?.system?.levels || 0;
      const rogueLevels = actor.items.filter(
        item => item.system.identifier === 'alternate-rogue',
      )[0]?.system?.levels || 0;
      const multiclassingLevel = fighterLevels + barbarianLevels + rogueLevels;
      return multiclassingLevel;
    },

    getAltMartialMCExploitsRemaining: function (totalLevel) {
      return game.modules.get('alternate-classes-55e').api.alternateMartialExploitMulticlassingTable[totalLevel - 1].exploitDice;
    },

    getAltMartialExploitsRemaining: function (item) {
      const { utils: { itemUtils } } = chrisPremades;
      const moduleAPI = game.modules.get('alternate-classes-55e').api;
      const totalLevel = moduleAPI.getAltMartialMCTotalLevel(item.actor);
      const multiclassUses = moduleAPI.getAltMartialMCExploitsRemaining(totalLevel);
      const martialExploits = itemUtils.getItemByIdentifier(item.actor, 'martialExploits');
      let martialExploitsUsesRemaining = martialExploits?.system?.uses?.value || 0;
      // ? Check Alternate Fighter's Martial Superiority feature
      const martialSuperiority = itemUtils.getItemByIdentifier(item.actor, 'ac55eMartialSuperiority');
      const martialSuperiorityUsesRemaining = martialSuperiority?.system?.uses?.value || 0;
      martialExploitsUsesRemaining = Math.max(martialExploitsUsesRemaining, martialSuperiorityUsesRemaining);
      const savageExploits = itemUtils.getItemByIdentifier(item.actor, 'savageExploits');
      const savageExploitsUsesRemaining = savageExploits?.system?.uses?.value || 0;
      const deviousExploits = itemUtils.getItemByIdentifier(item.actor, 'deviousExploits');
      const deviousExploitsUsesRemaining = deviousExploits?.system?.uses?.value || 0;
      const singleClassMax = Math.max(
        martialExploitsUsesRemaining,
        savageExploitsUsesRemaining,
        deviousExploitsUsesRemaining,
      );
      let remainingMulticlassUses = multiclassUses
        - martialExploits?.system?.uses?.spent || 0
        - savageExploits?.system?.uses?.spent || 0
        - deviousExploits?.system?.uses?.spent || 0;
      // if (
      //   item?.system?.type?.subtype === 'martialExploit'
      //   && moduleAPI.altMartialExploitsToDegrees[item.identifier] <= 2
      // ) {
      //   return martialSuperiority.system?.uses?.value || 0;
      // }
      return remainingMulticlassUses < 0
        ? singleClassMax
        : remainingMulticlassUses;
    },

    _spendAltFighterMartialSuperiority: async function (item) {
      const { utils: { itemUtils, genericUtils } } = chrisPremades;
      const moduleAPI = game.modules.get('alternate-classes-55e').api;
      // Only use Martial Superiority for 1st and 2nd degree exploits
      if (moduleAPI.altMartialExploitsToDegrees[item.identifier] > 2)
        return false;
      const martialSuperiority = itemUtils.getItemByIdentifier(
        item.actor,
        'ac55eMartialSuperiority',
      );
      if (!martialSuperiority) return false;
      if (!martialSuperiority.system?.uses?.value) return false;
      await genericUtils.update(martialSuperiority, {
        'system.uses.spent': martialSuperiority.system.uses.spent + 1,
      });
      return true;
    },

    spendAlternateMartialExploitUses: async function (uses, item) {
      const { utils: { genericUtils } } = chrisPremades;
      const moduleAPI = game.modules.get('alternate-classes-55e').api;
      // Alternate Fighter Martial Superiority
      if (
        uses === 1
        && item?.system?.type?.subtype === 'martialExploit'
        && await moduleAPI._spendAltFighterMartialSuperiority(item)
      )
        return;
      const {
        martialExploits,
        savageExploits,
        deviousExploits,
      } = moduleAPI.getAlternateMartialExploits(item.actor);
      if (deviousExploits) {
        const remainingUses = deviousExploits.system.uses.max - deviousExploits.system.uses.spent;
        await genericUtils.update(deviousExploits, {
          'system.uses.spent': deviousExploits.system.uses.spent + Math.min(uses, remainingUses),
        });
        uses -= Math.min(uses, remainingUses);
      }
      if (savageExploits && uses) {
        const remainingUses = savageExploits.system.uses.max - savageExploits.system.uses.spent;
        return await genericUtils.update(savageExploits, {
          'system.uses.spent': savageExploits.system.uses.spent + Math.min(uses, remainingUses),
        });
        uses -= Math.min(uses, remainingUses);
      }
      if (martialExploits && uses) {
        const remainingUses = martialExploits.system.uses.max - martialExploits.system.uses.spent;
        return await genericUtils.update(martialExploits, {
          'system.uses.spent': martialExploits.system.uses.spent + Math.min(uses, remainingUses),
        });
        uses -= Math.min(uses, remainingUses);
      }
      if (uses) {
        genericUtils.notify('Unknown class', 'error');
      }
    },

    getAlternateMartialExploitDie: function (item) {
      const moduleAPI = game.modules.get('alternate-classes-55e').api;
      const multiclassingLevel = moduleAPI.getAltMartialMCTotalLevel(item.actor);
      const multiclassingDie = moduleAPI.getAltMartialExploitDieForMulticlassLevel(multiclassingLevel);
      let fighterDie = item.actor.system.scale?.
        ['alternate-fighter']?.['exploit-die'];
      const masterAtArms = item
        .actor
        .classes['alternate-fighter']
        ?.subclass
        ?.identifier === 'master-at-arms';
      if (masterAtArms) {
        fighterDie = item.actor.system.scale
          ?.['master-at-arms']?.['exploit-die'];
      }
      const barbarianDie = item.actor.system.scale?.
        ['alternate-barbarian']?.['exploit-die'];
      const rogueDie = item.actor.system.scale?.
        ['alternate-rogue']?.['exploit-die'];
      const maxSingleClassDie = [
        fighterDie,
        barbarianDie,
        rogueDie,
      ]
        .filter(maxDie => maxDie)
        .sort((die1, die2) => die2.faces - die1.faces)[0];
      if (maxSingleClassDie?.faces < multiclassingDie.faces)
        return multiclassingDie;
      return maxSingleClassDie;
    },

    getAlternateMartialExploitDieWithActor: function (actor) {
      const moduleAPI = game.modules.get('alternate-classes-55e').api;
      const multiclassingLevel = moduleAPI.getAltMartialMCTotalLevel(actor);
      const multiclassingDie = moduleAPI.getAltMartialExploitDieForMulticlassLevel(multiclassingLevel);
      let fighterDie = actor.system.scale?.
        ['alternate-fighter']?.['exploit-die'];
      const masterAtArms = actor
        .classes['alternate-fighter']
        ?.subclass
        ?.identifier === 'master-at-arms';
      if (masterAtArms) {
        fighterDie = actor.system.scale
          ?.['master-at-arms']?.['exploit-die'];
      }
      const barbarianDie = actor.system.scale?.
        ['alternate-barbarian']?.['exploit-die'];
      const rogueDie = actor.system.scale?.
        ['alternate-rogue']?.['exploit-die'];
      const maxSingleClassDie = [
        fighterDie,
        barbarianDie,
        rogueDie,
      ]
        .filter(maxDie => maxDie)
        .sort((die1, die2) => die2.faces - die1.faces)[0];
      if (maxSingleClassDie?.faces < multiclassingDie.faces)
        return multiclassingDie;
      return maxSingleClassDie;
    },
  };
  console.log('Alternate Classes 5e | Initialized API');
});
