import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { format, resolveConfig } from 'prettier';

function toCamelCase(fileName) {
  return fileName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Generates a local macros.ts file for a directory containing raw macro files.
 * Accept an optional context name for descriptive console logs.
 */
function generateMacrosIndex(
  folderPath,
  indexFileName = 'macros.ts',
  contextName = '',
) {
  const files = readdirSync(folderPath)
    .filter((f) => f.endsWith('.ts') && f !== indexFileName)
    .sort();

  if (files.length === 0) return [];

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

  if (contextName) {
    console.log(
      `  -> Processed raw macros for ${contextName} (${names.length} found)`,
    );
  }

  return names;
}

/**
 * Deeply formats all created index files using your local Prettier settings.
 */
async function formatGeneratedFiles(filesToFormat) {
  if (filesToFormat.length === 0) return;
  const prettierConfig = await resolveConfig(filesToFormat[0]);

  for (const filePath of filesToFormat) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const formatted = await format(content, {
        parser: 'typescript',
        ...prettierConfig,
      });
      writeFileSync(filePath, formatted);
    } catch (error) {
      console.error(`Error formatting ${filePath}: ${error}`);
    }
  }
}

/**
 * Top-down aggregator script with structured logging outputs
 */
async function buildFromRoot() {
  const scriptsRoot = resolve('./src/scripts');
  const classesPath = join(scriptsRoot, 'classes');
  const classesIndexFile = join(classesPath, 'macros.ts');
  const rootIndexFile = join(scriptsRoot, 'macros.ts');

  if (!isDirectory(classesPath)) {
    console.error(`Error: Could not find classes directory at ${classesPath}`);
    return;
  }

  const filesToFormat = [rootIndexFile, classesIndexFile];
  const registeredClasses: string[] = [];

  const classDirs = readdirSync(classesPath).filter(
    (f) => f !== 'macros.ts' && isDirectory(join(classesPath, f)),
  );

  for (const classDir of classDirs) {
    // Determine a clean name for log output (e.g., "alternate-barbarian" -> "alternate-barbarian")
    const className = classDir;
    console.log(`\nGenerating macros.ts for ${className}...`);

    const classFullPath = join(classesPath, classDir);
    const featuresPath = join(classFullPath, 'class-features');
    const subclassPath = join(classFullPath, 'subclasses');

    const classImports: string[] = [];
    const classSpreads: string[] = [];

    // Process direct root macros inside the class folder if there are any
    const baseMacros = generateMacrosIndex(classFullPath, 'macros.ts');
    if (baseMacros.length > 0) {
      filesToFormat.push(join(classFullPath, 'macros.ts'));
    }

    // Process class-features/
    if (isDirectory(featuresPath)) {
      const featureMacros = generateMacrosIndex(
        featuresPath,
        'macros.ts',
        `${className} class-features`,
      );
      if (featureMacros.length > 0) {
        filesToFormat.push(join(featuresPath, 'macros.ts'));
        classImports.push(
          `import classFeatures from './class-features/macros.js';`,
        );
        classSpreads.push('...classFeatures');
      }
    }

    // Process subclasses/
    if (isDirectory(subclassPath)) {
      const subdirs = readdirSync(subclassPath).filter((f) =>
        isDirectory(join(subclassPath, f)),
      );
      const activeSubclasses: string[] = [];

      for (const subdir of subdirs) {
        const path = join(subclassPath, subdir);
        const subMacros = generateMacrosIndex(
          path,
          'macros.ts',
          `${className} subclass: ${subdir}`,
        );
        if (subMacros.length > 0) {
          activeSubclasses.push(subdir);
          filesToFormat.push(join(path, 'macros.ts'));
        }
      }

      if (activeSubclasses.length > 0) {
        const subIndexFile = join(subclassPath, 'macros.ts');
        filesToFormat.push(subIndexFile);

        const imports = activeSubclasses
          .map(
            (name) => `import ${toCamelCase(name)} from './${name}/macros.js';`,
          )
          .join('\n');

        const content = `import CPRMacro from 'chris-premades/macro.js';
${imports}

const macros: CPRMacro[] = [${activeSubclasses.map((n) => `...${toCamelCase(n)}`).join(', ')}];

export default macros;
`;
        writeFileSync(subIndexFile, content);

        classImports.push(`import subclasses from './subclasses/macros.js';`);
        classSpreads.push('...subclasses');
      }
    }

    // Generate the alternate-{CLASS_NAME}/macros.ts file aggregating its features and subclasses
    const classIndexFile = join(classFullPath, 'macros.ts');
    filesToFormat.push(classIndexFile);

    const classContent = `import CPRMacro from 'chris-premades/macro.js';
${classImports.join('\n')}

const macros: CPRMacro[] = [
  ${classSpreads.join(',\n  ')}
];

export default macros;
`;
    writeFileSync(classIndexFile, classContent);
    registeredClasses.push(classDir);

    console.log(`Generated macros.ts for ${className}.`);
  }

  // 2. Generate classes/macros.ts
  const classesImports = registeredClasses
    .map((c) => `import ${toCamelCase(c)} from './${c}/macros.js';`)
    .join('\n');
  const classesSpreads = registeredClasses
    .map((c) => `...${toCamelCase(c)}`)
    .join(',\n  ');

  const classesContent = `import CPRMacro from 'chris-premades/macro.js';
${classesImports}

const macros: CPRMacro[] = [
  ${classesSpreads}
];

export default macros;
`;
  writeFileSync(classesIndexFile, classesContent);

  // 3. Generate src/scripts/macros.ts
  const rootContent = `import CPRMacro from 'chris-premades/macro.js';
import classes from './classes/macros.js';

const macros: CPRMacro[] = [
  ...classes
];

export default macros;
`;
  writeFileSync(rootIndexFile, rootContent);
  console.log(
    `\nSuccessfully linked up clean top-down architecture index structural maps!`,
  );

  // 4. Run through prettier
  await formatGeneratedFiles(filesToFormat);
}

buildFromRoot();
