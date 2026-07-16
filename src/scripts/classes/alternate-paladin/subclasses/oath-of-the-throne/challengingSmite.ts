import subclassSmiteMacroFactory, {
  DuringSmiteCallback,
} from '../utils/subclassSmiteFactory.js';

const CHALLENGING_SMITE_EFFECT_DURATION_SECONDS = 60;

const during: DuringSmiteCallback = async ({ feat, workflow }) => {
  const {
    utils: { effectUtils },
  } = chrisPremades;
  const casterEffectData = {
    name: 'Challenging Smite: Source',
    img: feat.img!,
    origin: feat.uuid!,
    duration: { seconds: CHALLENGING_SMITE_EFFECT_DURATION_SECONDS },
    flags: {
      'chris-premades': {
        compelledDuel: {
          targetUuids: Array.from(workflow.targets).map(
            (target) => (target as Token).document.uuid,
          ),
        },
      },
    },
  };
  const effect = await effectUtils.createEffect(
    workflow.actor,
    casterEffectData,
  );
  const targetEffectData = {
    name: 'Challenging Smite: Target',
    img: feat.img!,
    origin: feat.uuid!,
    duration: casterEffectData.duration,
    flags: {
      'chris-premades': {
        compelledDuel: {
          sourceUuid: workflow.token?.document.uuid,
        },
      },
    },
  };
  for (const target of workflow.hitTargets) {
    await effectUtils.createEffect(target.actor!, targetEffectData, {
      parentEntity: effect,
      strictlyInterdependent: true,
      identifier: 'compelledDuelTarget',
      rules: 'modern',
      macros: [
        { type: 'midi.actor', macros: ['compelledDuelCompelled'] },
        { type: 'combat', macros: ['compelledDuelCompelled'] },
        { type: 'midi.item', macros: ['compelledDuelCompelled'] },
      ],
    });
  }
};

const challengingSmite = await subclassSmiteMacroFactory({
  name: 'Challenging Smite',
  subclass: 'Oath of the Throne',
  duringCallback: during,
});

export default challengingSmite;
