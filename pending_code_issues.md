- File: src/scripts/classes/alternate-fighter/subclasses/knight-errant/chivalricMark.ts
- Description: The `feat.actor!` is implicitly typed as `Actor5e` from context (given `Item<'feat'>`), making the explicit cast to `(feat.actor! as Actor5e)` redundant in `duringApply`.
- Suggested Fix: Remove redundant type assertion.
```typescript
  const maxDistance =
    feat.actor!.classes['alternate-fighter'].system.levels >= 10
      ? CHIVALRIC_MARK_LEVEL_10_DISTANCE
      : CHIVALRIC_MARK_DEFAULT_DISTANCE;
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/knight-errant/nobleGuardian.ts
- Description: The `ChatMessage.getSpeaker({ actor: feat.actor as any })` contains an unnecessary `as any` type assertion. Given `feat` is typed as `Item<'feat'>`, `feat.actor` is correctly inferred as `Actor5e`.
- Suggested Fix: Remove the redundant `as any` cast.
```typescript
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: feat.actor }),
    content: workflow.attackTotal < targetAC ? successMessage : failureMessage,
  });
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/knight-errant/nobleGuardian.ts
- Description: The `ChatMessage.getSpeaker({ actor: feat.actor as any })` contains an unnecessary `as any` type assertion. Given `feat` is typed as `Item<'feat'>`, `feat.actor` is correctly inferred as `Actor5e`. This `as any` cast was introduced in this PR.
- Suggested Fix: Remove the redundant `as any` cast.
```typescript
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: feat.actor }),
    content: workflow.attackTotal < targetAC ? successMessage : failureMessage,
  });
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/runecarver/runicWard.ts
- Description: The chained `map` and `filter` operations for `usableRunes` are functionally correct but could be slightly more readable if broken into a loop or a `flatMap` if applicable, reducing repetition of `as Item<'feat'>`.
- Suggested Fix: Consider refactoring for clearer intent, e.g., using a `for...of` loop with a conditional push to `usableRunes`.
```typescript
    const usableRunes: Item<'feat'>[] = [];
    for (const identifier of runeIdentifiers) {
      const rune = itemUtils.getItemByIdentifier(feat.actor!, identifier);
      if (rune && isRuneInvokable(rune as Item<'feat'>).usable) {
        usableRunes.push(rune as Item<'feat'>);
      }
    }
    const rune = (await dialogUtils.selectDocumentDialog(
```

---

- File: src/hooks/alternateMartialLevelUpdate.ts
- Description: The explicit `as any` assertion for the hook name `dnd5e.advancementManagerComplete` is technically functional but is a type escape hatch. While Foundry's type definitions for hooks can sometimes be incomplete, it's generally preferable to avoid `as any` where possible for clearer type inference and to leverage TypeScript fully.
- Suggested Fix: Explore if a more precise type assertion or a way to extend the `Hooks` interface with this specific hook can be done within the project's ambient types, or simply add a comment explaining why `as any` is necessary.
```typescript
Hooks.on(
  'dnd5e.advancementManagerComplete', // If type definitions are updated to include this string literal
  async ({ actor }: { actor: Actor5e }) => {
    // ...
  },
);
```

---

(These will be stored and reviewed when PRs addressing those themes are opened)

- File: src/hooks/alternateMartialLevelUpdate.ts
- Description: The explicit `as any` assertion for the hook name `'dnd5e.advancementManagerComplete'` is a type escape hatch. While Foundry's type definitions for hooks can sometimes be incomplete, it's generally preferable to avoid `as any` where possible to leverage TypeScript fully and for clearer type inference.
- Suggested Fix: Explore if a more precise type assertion or a way to extend the `Hooks` interface with this specific hook can be done within the project's ambient types, or add a comment explaining why `as any` is strictly necessary.

---

- File: src/scripts/classes/alternate-fighter/subclasses/sylvan-archer/macros.ts
- Description: The import path for `CPRMACRO` is `../../../../../types/chris-premades/macro.js`, which is excessively deep and inconsistent with other `chris-premades` imports like `chris-premades/macro.js`.
- Suggested Fix: Update the import path to the canonical `chris-premades/macro.js`.
```typescript
import CPRMacro from 'chris-premades/macro.js'; // Use consistent path
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/sylvan-archer/enchantedShotSave.ts
- Description: The import path for `CPRMACRO` is `../../../../../types/chris-premades/macro.js`, which is excessively deep and inconsistent with other `chris-premades` imports.
- Suggested Fix: Update the import path to the canonical `chris-premades/macro.js`.
```typescript
import CPRMacro, {
  MidiMacroFunction,
} from 'chris-premades/macro.js'; // Use consistent path
```

---

- File: src/scripts/exploits/4th-degree/expertFocus.ts
- Description: The `await fromUuid((value as any).id)` contains an `as any` type assertion. While sometimes necessary with external libraries like Foundry VTT, it's an escape hatch that ideally should be minimized or accompanied by a clear justification.
- Suggested Fix: Explore if a more precise type can be used for `value.id`, or add a comment explaining why `as any` is strictly necessary here.

---

- File: src/hooks/alternateMartialCharSheet.ts
- Description: The explicit `as any` assertions for the hook name `'dnd5e.prepareSheetContext'` and `customElements.get(...) as any` are type escape hatches. While Foundry's type definitions for hooks can sometimes be incomplete, it's generally preferable to avoid `as any` where possible to leverage TypeScript fully and for clearer type inference.
- Suggested Fix: Explore if a more precise type assertion or a way to extend the `Hooks` interface with this specific hook can be done within the project's ambient types, or add a comment explaining why `as any` is strictly necessary.

---

- File: src/scripts/classes/alternate-fighter/subclasses/runecarver/runicWard.ts
- Description: The chained `map` and `filter` operations for `usableRunes` contain repetitive `as Item<'feat'>` type assertions, which can reduce readability and verbosity.
- Suggested Fix: Refactor the `usableRunes` creation into a more explicit loop to reduce redundant type assertions and improve clarity.
```typescript
    const usableRunes: Item<'feat'>[] = [];
    for (const identifier of runeIdentifiers) {
      const rune = itemUtils.getItemByIdentifier(feat.actor!, identifier);
      // 'rune' can be Item | undefined here.
      // isRuneInvokable expects Item<'feat'>, so the cast is needed for the check.
      if (rune && isRuneInvokable(rune as Item<'feat'>).usable) {
        usableRunes.push(rune as Item<'feat'>); // Cast needed to ensure push is of Item<'feat'>
      }
    }
    const rune = (await dialogUtils.selectDocumentDialog(
```

---

- File: src/scripts/exploits/4th-degree/expertFocus.ts
- Description: The expression `(value as any).id` within `getProficientSkillsAndTools` uses an `as any` type assertion. While sometimes necessary with external libraries like Foundry VTT where type definitions might be incomplete, it's an escape hatch that ideally should be minimized or accompanied by a clear justification.
- Suggested Fix: Explore if a more precise type can be used for `value` to avoid the `as any`, or add a comment explaining why `as any` is strictly necessary here due to external type limitations.

---

- File: src/scripts/exploits/utils/exploitSetMinRollFactory.ts
- Description: The `macros` property in `ExploitSetMinRollFactoryArgs` uses an overly specific tuple type `[MacroKey] | [MacroKey, MacroKey?] | [MacroKey, MacroKey?, MacroKey?]` when `MacroKey[]` would be more concise and flexible, as it's filtered and cast to `MacroKey[]` anyway.
- Suggested Fix: Simplify the type definition for `macros` to `MacroKey[]`.
```typescript
interface ExploitSetMinRollFactoryArgs {
  // ...other properties
  macros: MacroKey[]; // Simplified type
  // ...other properties
}
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/runecarver/runicWard.ts
- Description: The iteration and filtering for `usableRunes` within the `pre` function involves repetitive `as Item<'feat'>` type assertions, which can make the code more verbose than necessary.
- Suggested Fix: Refactor the `usableRunes` creation into a more explicit `for...of` loop. This can reduce redundant type assertions and improve clarity by handling type narrowing explicitly.
```typescript
    const usableRunes: Item<'feat'>[] = [];
    for (const identifier of runeIdentifiers) {
      const rune = itemUtils.getItemByIdentifier(feat.actor!, identifier);
      if (rune && isRuneInvokable(rune as Item<'feat'>).usable) {
        usableRunes.push(rune as Item<'feat'>);
      }
    }
    const rune = (await dialogUtils.selectDocumentDialog(
```

---

No off-theme issues detected.

---

- File: src/scripts/classes/alternate-paladin/subclasses/oath-of-splendor/utils.ts
- Description: The `getChosenElement` function uses `forEach` with an internal `return feat;`. The `forEach` method does not support breaking early or returning a value to the caller. As a result, the function will always implicitly return `void`.
- Suggested Fix: Refactor to use a `for...of` loop or `Array.prototype.find()` to correctly return the found `feat` item.
```typescript
export const getChosenElement = (actor: Actor5e): Item<'feat'> | undefined => {
  const { utils: { itemUtils } } = chrisPremades;
  for (const element of ['Air', 'Earth', 'Fire', 'Water']) {
    const feat = itemUtils.getItemByIdentifier(
      actor,
      `ac55eOathOfSplendor${element}`,
    ) as Item<'feat'> | undefined;
    if (feat) {
      return feat;
    }
  }
  return undefined; // Explicitly return undefined if no element is found
};
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/runecarver/runicMight.ts
- Description: The size `lg` for 'large' is an abbreviation (`lg` vs `large`). Foundry VTT typically uses the full string names for sizes (e.g., 'tiny', 'sm', 'med', 'large', 'huge', 'grg'). While `lg` might be implicitly converted, using the explicit string literal 'large' would improve consistency and readability.
- Suggested Fix: Use the full string literal 'large' for the size.
```typescript
  const newSize = legendaryRuneLord ? 'huge' : 'large'; // Changed from 'lg'
```

---

- File: src/scripts/classes/alternate-paladin/class-features/anointedWarriorEvil.ts
- Description: The condition `if (ditem.newHP === ditem.oldHP && ditem.newTempHP === ditem.oldTempHP) return false;` in the `pre` function checks if an attack did not deal damage. This could be simplified by directly checking `ditem.totalDamage === 0` if `totalDamage` reliably reflects the damage dealt after all calculations.
- Suggested Fix:
```typescript
  // Check if the attack actually did damage
  if (ditem.totalDamage === 0)
    return false;
```

---

- File: src/scripts/classes/alternate-fighter/class-features/eyeForTalent.ts
- Description: The `during` function in `eyeForTalent.ts` is quite long, containing significant logic for determining target level, calculating DC, and applying effects. While inline functions are preferred, this function's length could impact readability and make it harder to quickly grasp its full scope.
- Suggested Fix: Consider extracting parts of the `during` function into smaller, well-named helper functions to improve modularity and readability. For example, `calculateDC(targetActor, item)`, `createBonusEffect(item, workflow, effect)`.

---

- File: src/hooks/alternateMartialLevelUpdate.ts
- Description: The explicit `as any` assertion for the hook name `'dnd5e.advancementManagerComplete'` is a type escape hatch. While Foundry's type definitions for hooks can sometimes be incomplete, it's generally preferable to avoid `as any` where possible to leverage TypeScript fully and for clearer type inference, or to add a comment explaining why `as any` is strictly necessary.
- Suggested Fix: Explore if a more precise type assertion or a way to extend the `Hooks` interface with this specific hook can be done within the project's ambient types.

---

- File: src/scripts/classes/alternate-fighter/subclasses/knight-errant/chivalricMark.ts
- Description: In the `duringApply` function, the expression `(feat.actor! as Actor5e)` to cast `feat.actor` is redundant. Since `feat` is typed as `Item<'feat'>`, `feat.actor` is already correctly inferred as `Actor5e`.
- Suggested Fix: Remove the redundant type assertion.
```typescript
  const maxDistance =
    feat.actor!.classes['alternate-fighter'].system.levels >= 10
      ? CHIVALRIC_MARK_LEVEL_10_DISTANCE
      : CHIVALRIC_MARK_DEFAULT_DISTANCE;
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/nobleGuardian.ts
- Description: The `ChatMessage.getSpeaker({ actor: feat.actor as any })` contains an unnecessary `as any` type assertion. Given `feat` is typed as `Item<'feat'>`, `feat.actor` is correctly inferred as `Actor5e`. This `as any` cast was introduced in this PR.
- Suggested Fix: Remove the redundant `as any` cast.
```typescript
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: feat.actor }),
    content: workflow.attackTotal < targetAC ? successMessage : failureMessage,
  });
```

---

- File: src/scripts/classes/alternate-fighter/subclasses/runecarver/runicWard.ts
- Description: In the `pre` function, the declaration of `rune` includes a redundant type assertion: `const rune = itemUtils.getItemByIdentifier(feat.actor!, identifier) as Item<'feat'> | undefined;`. `itemUtils.getItemByIdentifier` typically returns `Item | undefined` (or `Item | null`). While subsequent uses of `rune as Item<'feat'>` might be necessary for specific function calls expecting that exact type, the initial declaration can be simplified.
- Suggested Fix: Remove the redundant type assertion from the declaration line. The subsequent casts (`rune as Item<'feat'>`) may still be necessary for strict type adherence where the item type is critical.
```typescript
    const usableRunes: Item<'feat'>[] = [];
    for (const identifier of runeIdentifiers) {
      const rune = itemUtils.getItemByIdentifier(feat.actor!, identifier); // Simplified declaration
      if (rune && isRuneInvokable(rune as Item<'feat'>).usable) {
        usableRunes.push(rune as Item<'feat'>);
      }
    }
    const rune = (await dialogUtils.selectDocumentDialog(
```

---

- File: src/scripts/exploits/4th-degree/expertFocus.ts
- Description: The `await fromUuid((value as any).id)` within `getProficientSkillsAndTools` uses an `as any` type assertion. While sometimes necessary with Foundry VTT's dynamic typing, minimizing or justifying such escape hatches is good practice.
- Suggested Fix: Explore if a more precise type can be inferred or provided for `value` to avoid the `as any`, or add a comment explaining why `as any` is strictly necessary here due to external type limitations.

---

- File: src/scripts/exploits/utils/exploitSetMinRollFactory.ts
- Description: The `macros` property in `ExploitSetMinRollFactoryArgs` is defined with an overly specific tuple type `[MacroKey] | [MacroKey, MacroKey?] | [MacroKey, MacroKey?, MacroKey?]`. A simpler and more flexible `MacroKey[]` type would be sufficient and is already correctly handled by the code that iterates over it.
- Suggested Fix: Simplify the type definition for `macros` to `MacroKey[]`.
```typescript
interface ExploitSetMinRollFactoryArgs {
  // ...other properties
  macros: MacroKey[]; // Simplified type
  // ...other properties
}
```
---

---

- File: src/scripts/exploits/utils/exploitSetMinRollFactory.ts
- Description: The `macros` property in the `ExploitSetMinRollFactoryArgs` interface uses an overly specific tuple type `[MacroKey] | [MacroKey, MacroKey?] | [MacroKey, MacroKey?, MacroKey?]`. A simpler and more flexible `MacroKey[]` type would be sufficient and would improve the clarity and maintainability of the type definition.
- Suggested Fix: Simplify the type definition for `macros` to `MacroKey[]`.
```typescript
interface ExploitSetMinRollFactoryArgs {
  // ...other properties
  macros: MacroKey[]; // Simplified type
  // ...other properties
}
```