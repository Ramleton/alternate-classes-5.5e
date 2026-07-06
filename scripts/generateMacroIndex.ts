import { readdirSync, statSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

function toCamelCase(fileName: string): string {
  return fileName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function generateMacrosIndex(
  folderPath: string,
  indexFileName = 'macros.ts',
): string[] {
  const files = readdirSync(folderPath)
    .filter((f) => f.endsWith('.ts') && f !== indexFileName)
    .sort();

  if (files.length === 0) {
    return [];
  }

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
    `Generated ${indexFileName} in ${basename(folderPath)} with ${names.length} macros`,
  );

  return names;
}

function generateSubclassIndices(targetPath: string) {
  const subclassesPath = join(targetPath, '../../subclasses');

  if (!isDirectory(subclassesPath)) {
    console.log(`Subclasses directory not found at ${subclassesPath}`);
    return;
  }

  // Get all subdirectories in subclasses folder
  const subdirs = readdirSync(subclassesPath)
    .filter((f) => isDirectory(join(subclassesPath, f)))
    .sort();

  const subclassNames: string[] = [];

  // Step 1: Generate index for each subclass folder
  for (const subdir of subdirs) {
    const subclassPath = join(subclassesPath, subdir);
    const macroNames = generateMacrosIndex(subclassPath);

    if (macroNames.length > 0) {
      subclassNames.push(toCamelCase(subdir));
    }
  }

  // Step 2: Generate parent subclasses/macros.ts that spreads all subclass macros
  if (subclassNames.length > 0) {
    const imports = subclassNames
      .map((name) => `import ${name} from './${name}/macros.js';`)
      .join('\n');

    const content = `import CPRMacro from 'chris-premades/macro.js';
${imports}

const macros: CPRMacro[] = [${subclassNames.map((n) => `...${n}`).join(', ')}];

export default macros;
`;

    writeFileSync(join(subclassesPath, 'macros.ts'), content);
    console.log(
      `Generated subclasses/macros.ts aggregating ${subclassNames.length} subclasses`,
    );
  }

  // Step 3: Generate top-level macros.ts
  generateMacrosIndex(targetPath);
}

// Usage: pass the class folder path
const targetFolder = process.argv[2] ?? '.';
generateSubclassIndices(targetFolder);
