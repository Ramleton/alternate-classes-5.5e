import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import fs from 'fs';

const ai = new GoogleGenAI({});

async function generateWithRetry(
  config: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 3,
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(config);
    } catch (error: unknown) {
      const isRateLimit =
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        (error as { status: number }).status === 429;

      if (isRateLimit && attempt < maxRetries - 1) {
        const message = error instanceof Error ? error.message : String(error);
        const retryMatch = message.match(/retry in (\d+(\.\d+)?)s/);
        const waitMs = retryMatch ? parseFloat(retryMatch[1]) * 1000 : 60000;
        console.log(
          `Rate limited. Retrying in ${waitMs / 1000}s... (attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

function extractImports(content: string): Set<string> {
  const imports = new Set<string>();
  const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    imports.add(match[1]);
  }
  return imports;
}

function scoreRelatedness(
  changedFileContent: string,
  changedFilePath: string,
  siblingContent: string,
  siblingPath: string,
): number {
  let score = 0;

  const changedImports = extractImports(changedFileContent);
  const siblingImports = extractImports(siblingContent);

  const changedBaseName = changedFilePath
    .replace(/\.ts$/, '')
    .split('/')
    .pop()!;
  const siblingBaseName = siblingPath.replace(/\.ts$/, '').split('/').pop()!;

  // Direct reference: sibling imports the changed file, or vice versa
  if ([...siblingImports].some((imp) => imp.includes(changedBaseName))) {
    score += 10;
  }
  if ([...changedImports].some((imp) => imp.includes(siblingBaseName))) {
    score += 10;
  }

  // Shared imports suggest similar responsibility
  const sharedImports = [...changedImports].filter((imp) =>
    siblingImports.has(imp),
  );
  score += sharedImports.length * 2;

  return score;
}

async function runReview() {
  try {
    console.log('Analyzing Pull Request diff...');

    const baseBranch: string = process.env.GITHUB_BASE_REF || 'main';
    const prTitle: string = process.env.PR_TITLE || 'Unknown';
    const prBranch: string = process.env.PR_BRANCH || 'unknown';
    const prBody: string = process.env.PR_BODY || '';

    console.log(`PR Theme Context:`);
    console.log(`  Title: ${prTitle}`);
    console.log(`  Branch: ${prBranch}`);
    console.log(`  Base: ${baseBranch}`);

    const MAX_DIFF_CHARS = 50000;
    const rawDiff = execSync(
      `git diff origin/${baseBranch}...HEAD -- . ':!package-lock.json' ':!package.json'`,
    )
      .toString()
      .trim();

    if (!rawDiff) {
      console.log('No meaningful code changes detected.');
      return;
    }

    const diff = rawDiff.slice(0, MAX_DIFF_CHARS);
    if (rawDiff.length > MAX_DIFF_CHARS) {
      console.log(
        `Warning: diff truncated from ${rawDiff.length} to ${MAX_DIFF_CHARS} chars.`,
      );
    }

    // Get sibling files — scored by relatedness, only direct siblings of changed files
    let siblingFilesContext = '';
    const processedFiles: Set<string> = new Set<string>();

    const MAX_SIBLINGS_PER_DIR = 5;
    const MAX_SIBLING_FILE_CHARS = 3000;

    try {
      const changedFilesOutput: string = execSync(
        `git diff origin/${baseBranch}...HEAD --name-only -- '*.ts'`,
      )
        .toString()
        .trim();

      if (changedFilesOutput) {
        const changedFiles = changedFilesOutput.split('\n').filter(Boolean);

        console.log(`Found ${changedFiles.length} changed files.`);

        for (const changedFile of changedFiles) {
          const lastSlash = changedFile.lastIndexOf('/');
          const dir = lastSlash > -1 ? changedFile.substring(0, lastSlash) : '';
          if (!dir) continue;

          let changedFileContent = '';
          try {
            changedFileContent = fs.readFileSync(changedFile, 'utf-8');
          } catch {
            continue;
          }

          try {
            const siblingCandidates = fs
              .readdirSync(dir)
              .filter((f: string) => f.endsWith('.ts') && !f.startsWith('.'))
              .map((f: string) => `${dir}/${f}`)
              .filter((f) => f !== changedFile && !processedFiles.has(f));

            const scored = siblingCandidates
              .map((filePath) => {
                try {
                  const content = fs.readFileSync(filePath, 'utf-8');
                  const score = scoreRelatedness(
                    changedFileContent,
                    changedFile,
                    content,
                    filePath,
                  );
                  return { filePath, content, score };
                } catch {
                  return null;
                }
              })
              .filter(
                (entry): entry is NonNullable<typeof entry> => entry !== null,
              )
              .sort((a, b) => b.score - a.score)
              .slice(0, MAX_SIBLINGS_PER_DIR);

            for (const { filePath, content, score } of scored) {
              processedFiles.add(filePath);
              const truncated =
                content.length > MAX_SIBLING_FILE_CHARS
                  ? content.slice(0, MAX_SIBLING_FILE_CHARS) +
                    '\n... (truncated)'
                  : content;
              siblingFilesContext += `\n--- ${filePath} (relatedness: ${score}) ---\n${truncated}`;
            }
          } catch {
            // Skip missing directories
          }
        }

        console.log(
          `Including ${processedFiles.size} sibling files for comparison:`,
          Array.from(processedFiles),
        );
      }
    } catch {
      console.log('Warning: Could not retrieve sibling files for comparison.');
    }

    const contextualDiff: string =
      siblingFilesContext.length > 0
        ? `## Related Files in Same Folders (for duplication detection):\n${siblingFilesContext}\n\n## Changed Files (Git Diff):\n${diff}`
        : diff;

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
      // No pending issues file yet
    }

    const fullContext: string = contextualDiff + pendingIssuesContext;

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
    const response = await generateWithRetry({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Review this code:\n\n${fullContext}` }],
        },
      ],
      config: { systemInstruction },
    });

    let reviewContent: string | undefined = response!.text;

    if (!reviewContent || reviewContent.trim().length === 0) {
      console.log('Gemini returned empty review.');
      return;
    }

    reviewContent = reviewContent.replace(/\n\s+```/g, '\n```');
    reviewContent = reviewContent.replace(/```\s*\n/g, '```\n');

    const offThemeMatch = reviewContent.match(
      /## Off-Theme Issues for Future PRs\n([\s\S]*?)(?=\n## |$)/,
    );
    let offThemeIssues = '';
    if (offThemeMatch) {
      offThemeIssues = offThemeMatch[1].trim();
      reviewContent = reviewContent.replace(
        /\n## Off-Theme Issues for Future PRs[\s\S]*?(?=\n## Summarized Feedback|$)/,
        '',
      );
    }

    if (offThemeIssues) {
      try {
        const existingPending = fs.readFileSync(pendingFile, 'utf-8');

        const existingBlocks = existingPending
          .split(/\n---\n/)
          .map((b) => b.trim())
          .filter(Boolean);

        const newBlocks = offThemeIssues
          .split(/\n---\n/)
          .map((b) => b.trim())
          .filter(Boolean);

        const seen = new Set<string>();
        const deduped: string[] = [];

        for (const block of [...existingBlocks, ...newBlocks]) {
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
