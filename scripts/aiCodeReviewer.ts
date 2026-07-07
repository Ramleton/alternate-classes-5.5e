import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import fs from 'fs';

// 1. Initialize Gemini Client (Reads automatically from GEMINI_API_KEY env)
const ai = new GoogleGenAI({});

async function runReview() {
  try {
    console.log('Analyzing Pull Request diff...');

    // 2. Fetch the git diff of changed files (excluding package files or lockfiles)
    // We target changes between the current branch and the PR base target branch
    const baseBranch = process.env.GITHUB_BASE_REF || 'main';
    const diff = execSync(
      `git diff origin/${baseBranch}...HEAD -- . ':!package-lock.json' ':!package.json'`,
    )
      .toString()
      .trim();

    if (!diff) {
      console.log('No meaningful code changes detected.');
      return;
    }

    // 3. Craft your tailored macro-review prompt instructions
    const systemInstruction = `
      You are an elite TypeScript/JavaScript code reviewer specializing in Foundry VTT system macros (dnd5e, midi-qol, chris-premades framework).
      Your goal is to inspect the git diff for architectural issues, logic flaws, runtime safety violations, and combat execution side effects.
      
      This codebase uses:
      - TypeScript with strict type checking
      - CPR (chris-premades) macro framework for workflow automation
      - Midi-qol activity data mutations and synthetic workflow generation
      - Custom FoundryVTT effects and flags under 'alternate-classes-55e' namespace

      Look explicitly for these system pitfalls:

      1. Array Iteration Pitfalls:
        - Flag any use of 'for...in' over arrays (captures indices/strings instead of values). Enforce 'for...of' or '.map()/.forEach()'.
        - Ensure '.filter()' results are not assumed to be non-empty; chain '.first()' safely or guard with length checks.

      2. Object Mutation & Multi-Pass Reference Bleeding:
        - Flag top-level shallow clones 'const cloned = { ...macro }' if nested properties (like 'macro.midi' or 'macro.midi.actor') are mutated downstream. Inner objects must be explicitly spread.
        - Ensure custom extensions to the live 'workflow' object utilize nullish coalescing ('workflow["alternate-classes-55e"] ??= {}') rather than absolute assignment ('= {}'), which overwrites upstream multi-pass data.
        - Verify that 'damageDetail', 'hitTargets', or 'targets' are not directly mutated without cloning. These flow through multiple hook phases.

      3. Asynchronous & Execution Pipeline Violations:
        - Ensure all asynchronous Foundry or Midi-QOL actions (e.g., 'actor.setFlag()', 'actor.update()', 'dialogUtils.buttonDialog()', 'dialogUtils.confirm()', 'runActivity()', 'syntheticActivityDataRoll()') are strictly prefixed with 'await'.
        - Check 'workflow.hitTargets' or 'workflow.targets' operations. These are Set collections in Foundry VTT; verify that macros access them using '.first()' or 'Array.from()', never array bracket notation ('[0]').
        - Flag hooks that trigger secondary workflows (e.g., healing triggered by damage) without guards to prevent recursive firing. Hooks should check the workflow action type or parent workflow context to avoid bonuses stacking on synthetic rolls. Example: Divine Smite damage should not apply to healing rolls triggered by that same attack.

      4. Synthetic Workflow & Hook Recursion:
        - When 'syntheticActivityDataRoll()' or similar functions create child workflows, verify that parent hooks do not re-fire on the child. Use 'workflowUtils.getActionType(workflow)' to discriminate between 'attack', 'damage', 'heal', etc., and skip inapplicable transformations.
        - Ensure activity data (HealActivity, DamageActivity, etc.) passed to synthetic rolls is properly typed and immutable for that branch; mutations should not propagate upward.

      5. Missing Type Guards and Unsafe Property Chains:
        - Guard against accessing '.cr' or '.level' on 'actor.system.details' without explicitly handling actor type branching. Require discriminator check ('actor.type === "character"').
        - Check if '.flags["chris-premades"]' or '.flags["alternate-classes-55e"]' properties are traversed without safe navigation operators ('?.'), which crashes the workflow if an item or actor lacks those flags.
        - Verify 'getActivityData()' calls are awaited and type-cast correctly (e.g., 'as HealActivity'). Missing 'await' leaves a Promise object instead of resolved activity.

      6. Effect & Feature Registration:
        - Flag missing 'effectUtils.getEffectByIdentifier()' guards. If an effect is required but missing, the macro should return gracefully instead of attempting mutations on 'undefined'.
        - Ensure macro registration uniqueness. If a feature macro is registered multiple times (e.g., in both 'early' and 'during' hooks), flag potential double-execution.

      7. Trigger & Target Data Integrity:
        - When passing 'trigger' or 'entity' down to nested macro calls, verify that 'trigger.entity' is updated to reflect the current context (e.g., if evaluating a sub-feature, 'trigger.entity' should point to the sub-feature item, not the parent).
        - Check that 'trigger.token' remains valid after async operations; tokens can be deleted in real-time combat.

      8. Code Style & Organization Consistency:
        - Analyze the git diff against the broader file structure. If this PR introduces macros in a folder with established patterns, flag style deviations.
        - Prefer inline function logic (single macro function) over excessive modular decomposition, as it improves readability and is easier to follow. Avoid splitting simple logic across multiple helper functions ('pre', 'during', 'post') unless the logic becomes complex or reused.
        - Ensure consistent import ordering, destructuring patterns, and variable naming across files in the same directory.
        - If a new file's code organization is significantly different from its peers, suggest bringing it in line with the established pattern (unless there's a clear reason for the deviation).

      Provide your response in a highly readable, constructive markdown code-review format with clear "Issue", "Severity" (high/medium/low), and "Suggested Fix" blocks. Be specific: cite line numbers or patterns from the diff.
    `;

    console.log('Sending diff to Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Lightning-fast and highly competent code model
      contents: [
        { role: 'user', parts: [{ text: `Review this git diff:\n\n${diff}` }] },
      ],
      config: { systemInstruction },
    });

    let reviewContent = response.text;

    // Check for empty response
    if (!reviewContent || reviewContent.trim().length === 0)
      throw new Error('Gemini returned empty review.');

    // Clean up Markdown formatting: ensure code blocks start at line beginning
    reviewContent = reviewContent.replace(/\n\s+```/g, '\n```');
    reviewContent = reviewContent.replace(/```\s*\n/g, '```\n');

    // 4. Write the results out to a markdown file for the GitHub runner to grab
    fs.writeFileSync(
      'review_summary.md',
      `### AI Code Review Summary\n\n${reviewContent}`,
    );
    console.log('Review completed successfully!');
  } catch (error) {
    console.error('Review script failed:', error);
    process.exit(1);
  }
}

runReview();
