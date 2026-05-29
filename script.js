Hooks.once('init', () => {
  // Adds the class feature types from LaserLlama's Alternate Classes
  CONFIG.DND5E.featureTypes.class.subtypes.knack = 'Knack';
  CONFIG.DND5E.featureTypes.class.subtypes.deviousExploit = 'Devious Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.savageExploit = 'Savage Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.martialExploit = 'Martial Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.mysticTechnique = 'Mystic Technique';
  console.log('Alternate Classes 5e | Initialized class feature types');

  class WuJenSpellcasting extends dnd5e
    .dataModels
    .spellcasting
    .SingleLevelSpellcasting {
    /** @override */
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
  };
  console.log('Alternate Classes 5e | Initialized API');
});
