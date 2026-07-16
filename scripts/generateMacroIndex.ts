import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { format, resolveConfig } from 'prettier';

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

/**
 * Generates a local macros.ts file for a directory containing raw macro files.
 */
function generateMacrosIndex(
  folderPath: string,
  indexFileName = 'macros.ts',
  contextName = '',
): string[] {
  const files = readdirSync(folderPath)
    .filter((f) => f.endsWith('.ts') && f !== indexFileName && f !== 'utils.ts')
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
async function formatGeneratedFiles(filesToFormat: string[]): Promise<void> {
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
 * Processes class-related directories (features, subclasses) and compiles classes/macros.ts
 */
function processClassesFolder(
  classesPath: string,
  classesIndexFile: string,
  filesToFormat: string[],
): string[] {
  const registeredClasses: string[] = [];
  if (!isDirectory(classesPath)) return registeredClasses;

  const classDirs = readdirSync(classesPath).filter(
    (f) =>
      f !== 'macros.ts' && f !== 'utils' && isDirectory(join(classesPath, f)),
  );

  for (const classDir of classDirs) {
    const className = classDir;
    console.log(`\nGenerating macros.ts for ${className}...`);

    const classFullPath = join(classesPath, classDir);
    const featuresPath = join(classFullPath, 'class-features');
    const subclassPath = join(classFullPath, 'subclasses');

    const classImports: string[] = [];
    const classSpreads: string[] = [];

    const baseMacros = generateMacrosIndex(classFullPath, 'macros.ts');
    if (baseMacros.length > 0) {
      filesToFormat.push(join(classFullPath, 'macros.ts'));
    }

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

    if (isDirectory(subclassPath)) {
      const subdirs = readdirSync(subclassPath).filter(
        (f) => f !== 'utils' && isDirectory(join(subclassPath, f)),
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

  return registeredClasses;
}

/**
 * Processes degree exploits and handling subdirectories and compiles exploits/macros.ts
 */
function processExploitsFolder(
  exploitsPath: string,
  exploitsIndexFile: string,
): string[] {
  const registeredDegrees: string[] = [];
  const registeredExploitHandlers: string[] = [];

  if (!isDirectory(exploitsPath)) return registeredDegrees;

  console.log(`\nGenerating macros.ts for exploits...`);

  const degreeDirs = readdirSync(exploitsPath).filter(
    (f) =>
      f !== 'macros.ts' &&
      f !== 'utils' &&
      isDirectory(join(exploitsPath, f)) &&
      f.endsWith('-degree'),
  );

  for (const degreeDir of degreeDirs) {
    const degreeFullPath = join(exploitsPath, degreeDir);
    const degreeMacros = generateMacrosIndex(
      degreeFullPath,
      'macros.ts',
      `exploits/${degreeDir}`,
    );

    if (
      degreeMacros.length > 0 ||
      readdirSync(degreeFullPath).includes('macros.ts')
    ) {
      registeredDegrees.push(degreeDir);
    }
  }

  const handlingMacros = generateMacrosIndex(
    join(exploitsPath, 'handling'),
    'macros.ts',
    'exploits/handling',
  );

  if (
    handlingMacros.length > 0 ||
    readdirSync(join(exploitsPath, 'handling')).includes('macros.ts')
  ) {
    registeredExploitHandlers.push('handling');
  }

  if (registeredDegrees.length > 0) {
    const exploitsImports = registeredDegrees
      .map((d) => `import degree${toCamelCase(d)} from './${d}/macros.js';`)
      .join('\n');
    const exploitHandlerImports = registeredExploitHandlers
      .map((d) => `import ${toCamelCase(d)} from './handling/macros.js';`)
      .join('\n');
    const exploitsSpreads = registeredDegrees
      .map((d) => `...degree${toCamelCase(d)}`)
      .join(',\n  ');
    const exploitHandlersSpreads = registeredExploitHandlers
      .map((d) => `...${toCamelCase(d)}`)
      .join(',\n  ');

    const exploitsContent = `import CPRMacro from 'chris-premades/macro.js';
${exploitsImports}
${exploitHandlerImports}

const macros: CPRMacro[] = [
  ${exploitsSpreads},
  ${exploitHandlersSpreads}
];

export default macros;
`;
    writeFileSync(exploitsIndexFile, exploitsContent);
    console.log(`Generated macros.ts for exploits.`);
  } else {
    writeFileSync(exploitsIndexFile, `export default [];\n`);
  }

  return registeredDegrees;
}

/**
 * Compiles the root entrypoint macro file src/scripts/macros.ts
 */
function generateRootIndex(
  rootIndexFile: string,
  hasClasses: boolean,
  hasExploits: boolean,
): void {
  const rootImports: string[] = [];
  const rootSpreads: string[] = [];

  if (hasClasses) {
    rootImports.push(`import classes from './classes/macros.js';`);
    rootSpreads.push('...classes');
  }
  if (hasExploits) {
    rootImports.push(`import exploits from './exploits/macros.js';`);
    rootSpreads.push('...exploits');
  }

  const rootContent = `import CPRMacro from 'chris-premades/macro.js';
${rootImports.join('\n')}

const macros: CPRMacro[] = [
  ${rootSpreads.join(',\n  ')}
];

export default macros;
`;
  writeFileSync(rootIndexFile, rootContent);
  console.log(
    `\nSuccessfully compiled all class layouts and degree exploit structural branches!`,
  );
}

/**
 * Top-down orchestrator script mapping classes and exploits safely
 */
async function buildFromRoot(): Promise<void> {
  const scriptsRoot = resolve('./src/scripts');
  const classesPath = join(scriptsRoot, 'classes');
  const exploitsPath = join(scriptsRoot, 'exploits');

  const classesIndexFile = join(classesPath, 'macros.ts');
  const exploitsIndexFile = join(exploitsPath, 'macros.ts');
  const rootIndexFile = join(scriptsRoot, 'macros.ts');

  const filesToFormat = [rootIndexFile, classesIndexFile, exploitsIndexFile];

  const registeredClasses = processClassesFolder(
    classesPath,
    classesIndexFile,
    filesToFormat,
  );
  const registeredDegrees = processExploitsFolder(
    exploitsPath,
    exploitsIndexFile,
  );

  generateRootIndex(
    rootIndexFile,
    registeredClasses.length > 0,
    registeredDegrees.length > 0,
  );

  await formatGeneratedFiles(filesToFormat);
}

buildFromRoot();
