import { readdirSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

function toCamelCase(fileName: string): string {
  return fileName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function generateIndex(folderPath: string, indexFileName = 'macros.ts') {
  const files = readdirSync(folderPath)
    .filter((f) => f.endsWith('.ts') && f !== indexFileName)
    .sort();

  const names = files.map((f) => toCamelCase(basename(f, '.ts')));

  const imports = files
    .map((f, i) => `import ${names[i]} from './${basename(f, '.ts')}.js';`)
    .join('\n');

  const content = `import CPRMacro from 'chris-premades/macro.js';
${imports}

const macros: CPRMacro[] = [${names.join(', ')}];

export default macros;
`;

  writeFileSync(join(folderPath, indexFileName), content);
  console.log(
    `Generated ${indexFileName} with ${names.length} macros: ${names.join(', ')}`,
  );
}

// Usage: pass the target folder as a CLI arg, or hardcode it
const targetFolder = process.argv[2] ?? '.';
generateIndex(targetFolder);
