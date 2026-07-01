import { ScaleValueTypeDice } from 'fvtt-types/CharacterSystemData.js';

export const isQuarry = (
  sourceActor: Actor5e,
  targetActor: Actor5e,
): boolean => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const rangersQuarrySource = effectUtils.getEffectByIdentifier(
    sourceActor,
    'ac55eRangersQuarrySource',
  );
  const rangersQuarryEffect = effectUtils.getEffectByIdentifier(
    targetActor,
    'ac55eRangersQuarryTarget',
  );
  return !!(
    rangersQuarryEffect &&
    rangersQuarryEffect.origin === rangersQuarrySource?.uuid
  );
};

export const getQuarryDie = (
  actor: Actor5e,
): 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | undefined => {
  return (
    actor.system.scale['alternate-ranger']?.['quarry-die'] as ScaleValueTypeDice
  ).die as 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
};
