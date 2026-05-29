// Adds the class feature types from LaserLlama's Alternate Classes
Hooks.once('init', () => {
  CONFIG.DND5E.featureTypes.class.subtypes.knack = 'Knack';
  CONFIG.DND5E.featureTypes.class.subtypes.deviousExploit = 'Devious Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.savageExploit = 'Savage Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.martialExploit = 'Martial Exploit';
  CONFIG.DND5E.featureTypes.class.subtypes.mysticTechnique = 'Mystic Technique';

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
});
