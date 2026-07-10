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