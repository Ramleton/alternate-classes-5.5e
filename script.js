// Adds the class feature types from LaserLlama's Alternate Classes
Hooks.once("init", () => {
  CONFIG.DND5E.featureTypes.class.subtypes.knack = "Knack";
  CONFIG.DND5E.featureTypes.class.subtypes.deviousExploit = "Devious Exploit";
  CONFIG.DND5E.featureTypes.class.subtypes.savageExploit = "Savage Exploit";
  CONFIG.DND5E.featureTypes.class.subtypes.martialExploit = "Martial Exploit";
  CONFIG.DND5E.featureTypes.class.subtypes.mysticTechnique = "Mystic Technique";
});