import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({});

/**
 * Recursively scans directories to find type definitions (.d.ts or types.ts files)
 */
function gatherTypeContext(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Avoid traversing massive dependency folders
      if (file !== 'node_modules' && file !== '.git') {
        gatherTypeContext(filePath, fileList);
      }
    } else if (
      file.endsWith('.d.ts') ||
      file.toLowerCase().includes('types.ts')
    ) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function runReview() {
  try {
    console.log('Analyzing Pull Request diff...');

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

    // --- NEW: Gather Typings Context ---
    console.log('Gathering codebase type definitions for context...');
    const typeFiles: string[] = [];

    // Scan common type directories throughout the repository
    const targetDirs = ['types', 'src/types', 'src'];
    targetDirs.forEach((dir) =>
      gatherTypeContext(path.resolve(dir), typeFiles),
    );

    let compressedTypesContext = '';
    for (const filePath of typeFiles) {
      const relativePath = path.relative(process.cwd(), filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      // Basic minification to save prompt tokens while keeping structural interfaces
      const sanitizedContent = content
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '') // Strip comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();

      compressedTypesContext += `\n// File: ${relativePath}\n${sanitizedContent}\n`;
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

      REFERENCE ARCHITECTURE & TYPESYSTEM:
      You have been provided with the structural interfaces and ambient type declarations of this repository below. 
      Use these definitions to evaluate if properties, signatures, and object mutations inside the git diff align with our strict typesystem, paying special attention to how 'CharacterData', 'NPCData', and 'Actor5e' map fields like '.system.details'.
      
      --- START TYPE SYSTEM CONTEXT ---
      ${compressedTypesContext || '// No explicit type definitions found on disk.'}
      --- END TYPE SYSTEM CONTEXT ---

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
        - Guard against accessing '.cr' or '.level' on 'actor.system.details' without explicitly handling actor type branching. Require discriminator check ('actor.type === "character"'). Refer to the provided structural types to ensure type guards map cleanly.
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

      **Output Format:**
      Structure your response exactly as follows:

      ## Summary of Changes
      (2-3 sentences describing what files changed and their purpose)

      ## Feedback

      ### Issues
      List each issue with this format:
      - **File**: src/path/to/file.ts
      - **Severity**: High/Medium/Low
      - **Description**: Concise problem statement.
      - **Suggested Fix**: \`\`\`typescript ... \`\`\`

      If no issues found, write: "No issues detected."

      ### Warnings
      List any code smells, style inconsistencies, or best practice deviations that don't constitute errors but should be noted. Use same format as Issues.
      if none, write: "No warnings."

      ### Summarized Feedback
      (1-2 sentences summarizing the overall quality and any major takeaways)

      - Be direct and professional. No extra commentary beyond the structured sections above.
    `;

    console.log('Sending diff and context schema to Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Review this git diff:\n\n${diff}` }] },
      ],
      config: { systemInstruction },
    });

    let reviewContent = response.text;

    if (!reviewContent || reviewContent.trim().length === 0)
      throw new Error('Gemini returned empty review.');

    reviewContent = reviewContent.replace(/\n\s+```/g, '\n```');
    reviewContent = reviewContent.replace(/```\s*\n/g, '```\n');

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
