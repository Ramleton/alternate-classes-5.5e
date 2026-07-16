/// <reference types="node" />
import * as fs from 'node:fs';

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
  error?: unknown;
}

const readme = fs.readFileSync('README.md', 'utf8');
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is missing.');
  process.exit(1);
}

// Normalize version numbers
const rawVersion = process.env.VERSION_INPUT || '0.0.0';
const cleanVersion = rawVersion.replace(/^v/i, '');
const versionWithV = `v${cleanVersion}`;

// Safe release notes fallback
const releaseNotes =
  (process.env.RELEASE_INPUT || '').trim() ||
  'Minor updates, bug fixes, and maintenance.';

const formattedDate = new Date().toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

async function run(): Promise<void> {
  const prompt = `You are a technical documentation assistant. Update the README.md file provided below.
  
  CURRENT README CONTENT:
  ${readme}

  RELEASE NOTES / RAW CHANGES:
  ${releaseNotes}

  TASKS:
  1. Update the "Supported Classes & Automation Status" table. Based on the Release Notes, update mentioned classes to "✅ Implemented". Keep all other rows EXACTLY as they are.
  2. Add a new entry to the "Changelog" section at the top of the list for version ${versionWithV} (${formattedDate}).
     - CONDENSE AND REWRITE the raw Release Notes into 2-4 clean, human-readable bullet points highlighting functional features or bug fixes.
     - DO NOT output PR links (e.g., "Dev by @user in http..."). Extract or infer meaningful summary descriptions.
  3. Update the footer: **Current Module Version:** ${versionWithV} and **Latest Release Date:** ${formattedDate}.
  4. Locate the installation instructions and ensure the module manifest URL is exactly: 
    https://github.com/Ramleton/alternate-classes-5.5e/releases/download/${cleanVersion}/module.json
  
  STRICT RULES:
  - Output ONLY raw Markdown content. DO NOT wrap the output in \`\`\`markdown or \`\`\` code blocks.
  - Output the COMPLETE README file from start to finish without truncating.
  - DO NOT remove sections like Technology Stack, Project Structure, or Credits.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  const data = (await response.json()) as GeminiApiResponse;
  let textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    console.error('Failed to generate content:', JSON.stringify(data));
    process.exit(1);
  }

  // Safely strip outer code fences if present
  const codeBlockMatch = textOutput.match(
    /^```(?:markdown)?\n([\s\S]*?)\n```$/i,
  );
  if (codeBlockMatch) {
    textOutput = codeBlockMatch[1];
  } else {
    textOutput = textOutput
      .replace(/^```(?:markdown)?\s*/i, '')
      .replace(/\s*```$/i, '');
  }

  fs.writeFileSync('README.md', textOutput.trim() + '\n');
  console.log('README.md updated successfully.');
}

run().catch((err) => {
  console.error('Unhandled error updating README:', err);
  process.exit(1);
});
