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
- Description: The `ChatMessage.getSpeaker({ actor: feat.actor as any })` contains an unnecessary `as any` type assertion. Given `feat` is typed as `Item<'feat'>`, `feat.actor` is correctly inferred as `Actor5e`. This `as any` cast was introduced in this PR.
- Suggested Fix: Remove the redundant `as any` cast.
```typescript
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: feat.actor }),
    content: workflow.attackTotal < targetAC ? successMessage : failureMessage,
  });
```