// Type guard to narrow an actor down to a Character
export const isCharacterActor = (
  actor: Actor5e,
): actor is Actor5e & { system: CharacterData; type: 'character' } => {
  return actor.type === 'character';
};

// Type guard to narrow an actor down to an NPC
export const isNPCActor = (
  actor: Actor5e,
): actor is Actor5e & { system: NPCData; type: 'npc' } => {
  return actor.type === 'npc';
};
