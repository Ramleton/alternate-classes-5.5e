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

    // 2b. Extract folders from changed files and include sibling files for context
    const changedFiles = diff.match(/^diff --git a\/(.+?)\s/gm) || [];
    const folders = new Set<string>();
    const siblingContext: Record<string, string> = {};

    for (const fileMatch of changedFiles) {
      const filePath = fileMatch.match(/a\/(.+?)\s/)?.[1];
      if (filePath && filePath.endsWith('.ts')) {
        const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
        folders.add(folderPath);
      }
    }

    // Read sibling files in the same folders
    for (const folder of folders) {
      try {
        const files = fs
          .readdirSync(folder)
          .filter((f) => f.endsWith('.ts') && !f.startsWith('.'))
          .sort();

        for (const file of files) {
          const filePath = `${folder}/${file}`;
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            siblingContext[filePath] = content;
          } catch {
            // File read failed, skip
          }
        }
      } catch {
        // Folder doesn't exist or can't be read, skip
      }
    }

    const contextualDiff =
      Object.keys(siblingContext).length > 0
        ? `### Related Files in Same Folders (for duplication detection):\n${Object.entries(
            siblingContext,
          )
            .map(([path, content]) => `\n--- ${path} ---\n${content}`)
            .join('\n')}\n\n### Changed Files (Git Diff):\n${diff}`
        : diff;

    // 3. Craft your tailored macro-review prompt instructions
    const systemInstruction = `
      You are a code style and maintainability reviewer for TypeScript/JavaScript Foundry VTT macros.
      Your goal is to inspect the git diff for opportunities to improve code quality, consistency, and refactoring—NOT type safety or runtime errors (TypeScript handles those).
      
      This codebase uses:
      - TypeScript with strict type checking (type safety is already handled by the compiler)
      - CPR (chris-premades) macro framework for workflow automation
      - Inline function style (prefer single macro function over excessive helper decomposition)
      - Consistent naming and import patterns

      Focus on these areas:

      1. Code Duplication & DRY Principle:
        - Compare changed files against their sibling files in the same folder (provided in the context).
        - Flag repeated logic patterns that could be extracted into reusable utilities or helper functions.
        - Identify similar conditionals, type checks, or error handling patterns that appear across multiple files in the same folder.
        - Suggest extraction of commonly repeated patterns (e.g., "this validation logic appears in eloquentSpeech.ts, imposingPresence.ts, and roguishCharm.ts—extract to a shared utility").

      2. Naming & Consistency:
        - Compare naming patterns in the changed files against their siblings in the same folder.
        - Flag inconsistent variable naming conventions (camelCase vs snake_case, abbreviations) between related files.
        - Ensure function/constant names clearly express intent and match the patterns used by sibling files (e.g., all exploit macros should use 'bonus', 'use', etc. consistently).
        - Verify consistent naming patterns across the folder (e.g., all exploit macros in 1st-degree/ follow the same naming convention).

      3. Import Ordering & Organization:
        - Ensure imports are ordered consistently: external libraries, then relative paths, then types.
        - Flag missing or unused imports.
        - Verify destructuring patterns are consistent (destructure early vs. destructure on-use).

      4. Code Style & Readability:
        - Flag overly nested conditionals that could be flattened with early returns.
        - Suggest breaking down long function bodies (>50 lines) into logical sub-sections or helper functions.
        - Recommend extracting magic numbers or strings into named constants.

      5. Logic Flow & Control Flow:
        - Suggest simplifications in conditional chains (e.g., combining multiple 'if' checks into a single condition).
        - Flag logic that could be inverted for clarity (e.g., "if (!condition) return; // do work" → "if (condition) { // do work }").

      6. Comments & Documentation:
        - Flag non-obvious logic that should have inline comments.
        - Suggest removing redundant or outdated comments.

      **Output Format:**
      Structure your response exactly as follows:

      ## Summary of Changes
      (2-3 sentences describing what files changed and their purpose)

      ## Feedback

      ### Issues
      List each significant improvement opportunity:
      - **File**: src/path/to/file.ts
      - **Description**: Concise problem statement.
      - **Suggested Fix**: Code block with the refactored version.

      If no issues found, write: "No issues detected."

      ### Warnings
      List minor improvements, style inconsistencies, or best practice suggestions. Use same format as Issues.
      If none, write: "No warnings."

      ### Summarized Feedback
      (1-2 sentences summarizing overall code quality and maintainability)

      - Be direct and professional. Do NOT include commentary outside the structured sections.
    `;

    console.log('Sending diff to Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Lightning-fast and highly competent code model
      contents: [
        {
          role: 'user',
          parts: [{ text: `Review this code:\n\n${contextualDiff}` }],
        },
      ],
      config: { systemInstruction },
    });

    let reviewContent = response.text;

    // Check for empty response
    if (!reviewContent || reviewContent.trim().length === 0) {
      console.log('Gemini returned empty review.');
      return;
    }

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
