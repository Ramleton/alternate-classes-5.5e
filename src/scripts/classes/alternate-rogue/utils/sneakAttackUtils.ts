import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';

export const getSneakAttack = (actor: Actor5e) => {
  return actor.system.scale['alternate-rogue']?.[
    'sneak-attack'
  ] as ScaleValueTypeDice;
};
