import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import fs from 'fs';

// Initialize Gemini Client with expected config block
const ai = new GoogleGenAI({});

async function runReview() {
  try {
    console.log('Analyzing Pull Request diff...');

    // Fetch the git diff of changed files (excluding package files or lockfiles)
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

    // Craft your tailored macro-review prompt instructions focusing strictly on behavior
    const systemInstruction = `
      You are an expert code reviewer inspecting automated combat macros for a Foundry VTT module running dnd5e, midi-qol, and the chris-premades framework.
      
      CRITICAL RULE: Assume all TypeScript types, property accesses, syntax, and interfaces are 100% CORRECT and already validated by the compiler. Do NOT review, critique, or suggest fixes regarding type safety, property existence, or type casting.

      Instead, inspect the git diff ONLY for logic flaws, runtime side-effects, and framework execution bugs:

      1. Multi-Pass Reference Bleeding & Overwrites:
        - Ensure custom extensions to the live 'workflow' object utilize nullish coalescing ('workflow["alternate-classes-55e"] ??= {}') rather than absolute assignment ('= {}'), which completely overwrites upstream multi-pass data.
        - Flag top-level shallow clones 'const cloned = { ...macro }' if nested properties (like 'macro.midi' or 'macro.midi.actor') are mutated downstream. Inner objects must be explicitly spread.

      2. Asynchronous Execution Violations:
        - Verify that all asynchronous framework actions (e.g., 'actor.setFlag()', 'actor.update()', 'dialogUtils.buttonDialog()', 'dialogUtils.confirm()', 'runActivity()', 'syntheticActivityDataRoll()') are strictly prefixed with 'await'.

      3. Infinite Loop / Recursion Hazards:
        - Flag hooks triggering secondary workflows (like a healing roll triggered by an attack) if they lack a guard condition to stop infinite recursion or illegal bonus stacking on synthetic child rolls. Example: Divine Smite damage should not apply to healing rolls triggered by that same attack.

      4. Code Style & Organization Consistency:
        - Prefer inline function logic (single macro function) over excessive modular decomposition, as it improves readability and is easier to follow. Avoid splitting simple logic across multiple helper functions ('pre', 'during', 'post') unless the logic becomes complex or reused.

      **Output Format:**
      Structure your response exactly as follows:

      ## Summary of Changes
      (2-3 sentences describing what files changed and their purpose)

      ## Feedback

      ### Issues
      List each issue with this format:
      - **File**: src/path/to/file.ts
      - **Severity**: High/Medium/Low
      - **Description**: Concise runtime logic problem statement.
      - **Suggested Fix**: \`\`\`typescript ... \`\`\`

      If no issues found, write: "No issues detected."

      ### Warnings
      List code smells or best practice deviations. Use same format as Issues. If none, write: "No warnings."

      ### Summarized Feedback
      (1-2 sentences summarizing overall quality)

      - Be direct and professional. No extra commentary outside the structured sections above.
    `;

    console.log('Sending diff to Gemini...');
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

    // Clean up Markdown formatting: ensure code blocks start at line beginning
    reviewContent = reviewContent.replace(/\n\s+```/g, '\n```');
    reviewContent = reviewContent.replace(/```\s*\n/g, '```\n');

    // Write the results out to a markdown file for the GitHub runner to grab
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
