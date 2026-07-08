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
    const baseBranch: string = process.env.GITHUB_BASE_REF || 'main';
    const prTitle: string = process.env.PR_TITLE || 'Unknown';
    const prBranch: string = process.env.PR_BRANCH || 'unknown';
    const prBody: string = process.env.PR_BODY || '';

    console.log(`PR Theme Context:`);
    console.log(`  Title: ${prTitle}`);
    console.log(`  Branch: ${prBranch}`);
    console.log(`  Base: ${baseBranch}`);

    const diff = execSync(
      `git diff origin/${baseBranch}...HEAD -- . ':!package-lock.json' ':!package.json'`,
    )
      .toString()
      .trim();

    if (!diff) {
      console.log('No meaningful code changes detected.');
      return;
    }

    // 2b. Get sibling files in the same folders as changed files
    let siblingFilesContext = '';
    const processedFiles: Set<string> = new Set<string>();

    try {
      // Get directories of changed files
      const changedFilesOutput: string = execSync(
        `git diff origin/${baseBranch}...HEAD --name-only -- '*.ts'`,
      )
        .toString()
        .trim();

      if (changedFilesOutput) {
        const changedDirs = new Set<string>(
          changedFilesOutput
            .split('\n')
            .map((f: string) => {
              const lastSlash = f.lastIndexOf('/');
              return lastSlash > -1 ? f.substring(0, lastSlash) : f;
            })
            .filter(Boolean),
        );

        console.log(
          `Found ${changedDirs.size} directories with changes:`,
          Array.from(changedDirs),
        );

        // For each directory, get all TypeScript files
        for (const dir of changedDirs) {
          try {
            const siblingFiles: string[] = fs
              .readdirSync(dir)
              .filter((f: string) => f.endsWith('.ts') && !f.startsWith('.'))
              .sort();

            for (const file of siblingFiles) {
              const filePath = `${dir}/${file}`;

              // Skip if already processed
              if (processedFiles.has(filePath)) {
                continue;
              }
              processedFiles.add(filePath);

              try {
                const content: string = fs.readFileSync(filePath, 'utf-8');
                siblingFilesContext += `\n--- ${filePath} ---\n${content}`;
              } catch {
                // Skip if can't read
              }
            }
          } catch {
            // Skip if directory doesn't exist
          }
        }

        console.log(
          `Including ${processedFiles.size} sibling files for comparison:`,
          Array.from(processedFiles),
        );
      }
    } catch {
      // If sibling retrieval fails, continue without it
      console.log('Warning: Could not retrieve sibling files for comparison.');
    }

    const contextualDiff: string =
      siblingFilesContext.length > 0
        ? `## Related Files in Same Folders (for duplication detection):\n${siblingFilesContext}\n\n## Changed Files (Git Diff):\n${diff}`
        : diff;

    // Load pending issues from previous PRs to check if any are now relevant
    let pendingIssuesContext = '';
    const pendingFile = 'pending_code_issues.md';
    try {
      const pendingContent = fs.readFileSync(pendingFile, 'utf-8');
      if (pendingContent.trim()) {
        pendingIssuesContext = `\n\n## Pending Issues from Previous PRs (check if any are now relevant to this PR):\n${pendingContent}`;
        console.log(
          'Found pending issues from previous PRs—checking relevance.',
        );
      }
    } catch {
      // No pending issues file
    }

    const fullContext: string = contextualDiff + pendingIssuesContext;

    // 3. Craft your tailored macro-review prompt instructions
    const systemInstruction = `You are a code style and maintainability reviewer for TypeScript/JavaScript Foundry VTT macros.
Your goal is to inspect the git diff for opportunities to improve code quality, consistency, and refactoring—NOT type safety or runtime errors (TypeScript handles those).

PR Context (use this to determine relevance of issues):
- PR Title: ${prTitle}
- Branch Name: ${prBranch}
- PR Description: ${prBody || '(none provided)'}

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

2. Naming & Consistency:
- Compare naming patterns in the changed files against their siblings in the same folder.
- Flag inconsistent variable naming conventions (camelCase vs snake_case, abbreviations) between related files.
- Ensure function/constant names clearly express intent and match the patterns used by sibling files.

3. Import Ordering & Organization:
- Ensure imports are ordered consistently: external libraries, then relative paths, then types.
- Flag missing or unused imports.
- Verify destructuring patterns are consistent.

4. Code Style & Readability:
- Flag overly nested conditionals that could be flattened with early returns.
- Suggest breaking down long function bodies into logical sub-sections or helper functions.
- Recommend extracting magic numbers or strings into named constants.

5. Logic Flow & Control Flow:
- Suggest simplifications in conditional chains.
- Flag logic that could be inverted for clarity.

6. Comments & Documentation:
- Flag non-obvious logic that should have inline comments.
- Suggest removing redundant or outdated comments.

7. Design Patterns & Architectural Opportunities:
- Identify repeated object creation or initialization patterns that could benefit from Factory pattern (especially common in this codebase).
- Flag chains of conditional logic that could use Strategy pattern for cleaner implementation.
- Suggest Template Method pattern where similar workflows are repeated with minor variations.
- Identify cases where Builder pattern could simplify complex object construction.
- Look for opportunities to extract shared behavior into base classes or mixins.
- Suggest applying established patterns from the codebase (e.g., if sibling files use Factory pattern, new code should too).

Output Format:
Structure your response exactly as follows:

## Summary of Changes
(2-3 sentences describing what files changed and their purpose)

## Feedback

### Issues

- File: src/path/to/file.ts
- Description: Concise problem statement.
- Suggested Fix: Code block with the refactored version.

---

(Repeat with --- divider between each issue. If no issues found, write: "No issues detected.")

### Warnings
List minor improvements with same format. If none, write: "No warnings."

### Summarized Feedback
(1-2 sentences summarizing overall code quality and maintainability)

**IMPORTANT - PR Theme & Issue Relevance:**
Determine the PR's primary theme based on:
1. PR title (most explicit signal of intent)
2. Branch name (e.g., feature/*, bugfix/*, docs/*)
3. PR description content
4. Files changed in the diff

For each issue you find:
- Does it directly relate to the theme identified above?
- Or is it a separate concern that could wait for a more appropriate PR?

Output ONLY on-theme issues in the main ### Issues section.

If you identify off-theme issues that are still valuable (e.g., style inconsistencies unrelated to this PR's changes), add a new section:

## Off-Theme Issues for Future PRs
(These will be stored and reviewed when PRs addressing those themes are opened)

- File: src/path/to/file.ts
- Description: Problem statement.
- Suggested Fix: ...

---

(The script will extract this section and save it for future PRs.)

**IMPORTANT - Final Validation:**
Before submitting, review each issue you identified:
- Is this actually a problem in the code, or is it already correctly implemented?
- Is this a genuine code quality issue, or just a description of working code?
- Would removing this issue make the review clearer and more actionable?
- Does the code already follow the pattern you're suggesting?

If the answer to any of the above is "yes, this is already correct", DELETE that issue from your output. Only include genuine, actionable improvements.

Be direct and professional. Do NOT include commentary outside the structured sections.`;

    console.log('Sending diff to Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Review this code:\n\n${fullContext}` }],
        },
      ],
      config: { systemInstruction },
    });

    let reviewContent: string | undefined = response.text;

    // Check for empty response
    if (!reviewContent || reviewContent.trim().length === 0) {
      console.log('Gemini returned empty review.');
      return;
    }

    // Clean up Markdown formatting: ensure code blocks start at line beginning
    reviewContent = reviewContent.replace(/\n\s+```/g, '\n```');
    reviewContent = reviewContent.replace(/```\s*\n/g, '```\n');

    // Extract off-theme issues if present (section added by Gemini)
    const offThemeMatch = reviewContent.match(
      /## Off-Theme Issues for Future PRs\n([\s\S]*?)(?=\n## |$)/,
    );
    let offThemeIssues = '';
    if (offThemeMatch) {
      offThemeIssues = offThemeMatch[1].trim();
      // Remove off-theme section from the PR comment
      reviewContent = reviewContent.replace(
        /\n## Off-Theme Issues for Future PRs[\s\S]*?(?=\n## Summarized Feedback|$)/,
        '',
      );
    }

    // Save off-theme issues for next PR
    if (offThemeIssues) {
      try {
        const existingPending = fs.readFileSync(pendingFile, 'utf-8');

        // Split both existing and new issues into individual blocks
        const existingBlocks = existingPending
          .split(/\n---\n/)
          .map((b) => b.trim())
          .filter(Boolean);

        const newBlocks = offThemeIssues
          .split(/\n---\n/)
          .map((b) => b.trim())
          .filter(Boolean);

        // Deduplicate by using the File + Description as a key
        const seen = new Set<string>();
        const deduped: string[] = [];

        for (const block of [...existingBlocks, ...newBlocks]) {
          // Extract file + description lines as a stable identity key
          const fileMatch = block.match(/- File: (.+)/);
          const descMatch = block.match(/- Description: (.+)/);
          const key = `${fileMatch?.[1] ?? ''} | ${descMatch?.[1] ?? ''}`;

          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(block);
          }
        }

        fs.writeFileSync(pendingFile, deduped.join('\n\n---\n\n'));
      } catch {
        fs.writeFileSync(pendingFile, offThemeIssues);
      }
      console.log('Stored off-theme issues for future PRs.');
    }

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
