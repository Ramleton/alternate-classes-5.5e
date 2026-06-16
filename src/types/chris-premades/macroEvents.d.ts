export type MidiQOLEvent
/** Run before targeting is complete. */
  = | 'preTargeting'
    | 'preItemRoll' // Run before the item is rolled.
    | 'targetPreItemRoll' // Run before the item is rolled, but macros are pulled from the targets instead of attacker.
    | 'preambleComplete' // Run after targeting is complete.
    | 'targetPreambleComplete' // Run after targeting is complete, but macros are pulled from the targets instead of attacker.
    | 'scenePreambleComplete' // Run after targeting is complete, but checks all tokens on the scene for macros. (Useful for 3rd party reactions).
    | 'preAttackRollConfig' // Runs before the attack roll configuration popup
    | 'postAttackRollConfig' // Runs after the attack roll configuration popup
    | 'postAttackRoll' // Runs after the Attack Roll is complete, but before checking for hits.
    | 'targetPostAttackRoll' // Runs after the attack roll is complete, but before checking for hits. Macros are pulled from the targets instead of attacker.
    | 'scenePostAttackRoll' // Runs after the attack roll is complete, but before checking for hits. Macros are pulled from all tokens on the scene. (Useful for 3rd party reactions).
    | 'attackRollComplete' // Runs after the attack roll is complete and the hit is confirmed.
    | 'targetAttackRollComplete' // Runs after the attack roll is complete and the hit is confirmed. Macros are pulled from the target instead of the attacker.
    | 'damageRollComplete' // Runs after the damage roll is complete, but before checking resistances and immunities. (Useful for bonus damage automations).
    | 'damage' // Runs for every target token. Allows for modification of damage on a per-token basis.
    | 'applyDamage' // Runs after damage has been applied to the target.
    | 'targetApplyDamage' // Runs after damage has been applied to the target, but the macros are pulled from the target.
    | 'sceneApplyDamage' // Runs after damage has been applied to the target, but the macros are pulled from all tokens on the scene. (Useful for 3rd party reactions).
    | 'rollFinished' // Runs after all other events are complete. Useful for for macros that don't need to alter the Midi-Qol workflow.
    | 'targetRollFinished'; // Runs after all other events are complete. Macros are pulled from the target instead of the attacker.

export type EffectEvent
  = | 'created' // Run when an effect is created.
    | 'deleted' // Run when an effect is deleted.
    | 'preCreateEffect' // Run when an effect is about to be created. This allows modification of the effect data before it's created. Runs sync, async functions are not supported in this pass.
    | 'preUpdateEffect' // Run when an effect is about to be updated. Runs sync, async functions are not supported in this pass.
    | 'actorCreated' // Run when any effect is created on the actor.
    | 'actorDeleted'; // Run when any effect is deleted on the actor.

/**
 * - 'turnEnd' - Runs when the token's turn ends.
 * - 'turnStart' - Runs when the token's turn starts.
 * - 'everyTurn' - Runs when any token starts it's turn.
 * - 'turnEndNear' - Runs when a token ends it's turn, but looks for macros from nearby tokens.
 * - 'turnStartNear' - Runs when a token starts it's turn, but looks for macros from nearby tokens.
 * - 'combatStart' - Runs when the combat starts.
 * - 'combatEnd' - Runs when the combat ends.
 * - 'turnStartSource' - Runs when the source of the effect, template, or region starts it's turn.
 * - 'turnEndSource' - Runs when the source of the effect, template, or region ends it's turn.
 */
export type CombatEvent
  = | 'turnEnd'
    | 'turnStart'
    | 'everyTurn'
    | 'turnEndNear'
    | 'turnStartNear'
    | 'combatStart'
    | 'combatEnd'
    | 'turnStartSource'
    | 'turnEndSource';

export type TemplateEvent
  = | 'moved' // Runs when the template is moved.
    | 'left' // Runs when a token leaves a template.
    | 'enter' // Runs when a token enters a template.
    | 'stay' // Runs when a token stays in a template when it moves.
    | 'passedThrough'; // Runs when a token passes through a template but doesn't stop in a template.

export type MovementEvent
  = | 'moved' // Runs when a token is moved.
    | 'movedNear' // Runs when a token moves near another token.
    | 'movedScene'; // Runs when a token is moved but looks for macros on all tokens on the scene.

export type RestEvent
  = | 'long' // Runs when a token takes a long rest.
    | 'short'; // Runs when a token takes a short rest.

export type D20Event
  = | 'situational' // Runs right before an Ability Check or Saving Throw is rolled.
    | 'targetSituational' // Runs right before an Ability Check or Saving Throw is rolled, macros are pulled from the actor forcing the Saving Throw.
    | 'sceneSituational' // Runs right before an Ability Check or Saving Throw is rolled. The macros are pulled from all tokens on the scene. (Useful for 3rd Party Reactions)
    | 'context' // Runs right before an Ability Check or Saving Throw is rolled. Must return specifically formatted data, which is used in a dialog.
    | 'bonus' // Runs after an Ability Check or Saving Throw is rolled. Used to modify the roll before being rendered.
    | 'sceneBonus' // Runs after an Ability Check or Saving Throw is rolled. Used to modify the roll before being rendered. The macros are pulled from all tokens on the scene. (Useful for 3rd party reactions).
    | 'post';

export type AuraEvent
  = | 'create'; // Run when the aura handler thinks a token should be getting an aura. It expects effect data to be returned (or undefined).

export type RegionEvent
  = | 'left' // Runs when a token leaves a region.
    | 'enter' // Runs when a token enters a region.
    | 'stay' // Runs when a token stays in a region when it moves.
    | 'passedThrough'; // Runs when a token passes through a region but doesn't stop in a region.

export type ItemEvent
  = | 'created' // Run when an item is created on an actor.
    | 'deleted' // Run when an item is deleted off an actor.
    | 'actorCreated' // Run when any item is created on an actor.
    | 'actorDeleted' // Run when any item is deleted off an actor.
    | 'equipped' // Run when the item is equipped on an actor.
    | 'unequipped' // Run when the item is unequipped off an actor.
    | 'actorEquipped' // Run when any item is equipped on an actor.
    | 'actorUnequipped' // Run when any item is unequipped off an actor.
    | 'itemMedkit' // Run after an item is medkit. This includes being actor medkit.
    | 'actorMedkit' // Run after an actor medkit is applied
    | 'actorMunch'; // Run after a character has been imported via the DDBI module.

export type MacroEvent
  = | MidiQOLEvent
    | EffectEvent
    | AuraEvent
    | CombatEvent
    | TemplateEvent
    | MovementEvent
    | RestEvent
    | D20Event
    | RegionEvent
    | ItemEvent;
