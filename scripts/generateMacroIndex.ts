import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { format, resolveConfig } from 'prettier';

function toCamelCase(fileName: string) {
  return fileName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function isDirectory(path: string) {
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
  folderPath,
  indexFileName = 'macros.ts',
  contextName = '',
) {
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
 * Top-down aggregator script mapping classes and exploits safely
 */
async function buildFromRoot() {
  const scriptsRoot = resolve('./src/scripts');
  const classesPath = join(scriptsRoot, 'classes');
  const exploitsPath = join(scriptsRoot, 'exploits');

  const classesIndexFile = join(classesPath, 'macros.ts');
  const exploitsIndexFile = join(exploitsPath, 'macros.ts');
  const rootIndexFile = join(scriptsRoot, 'macros.ts');

  const filesToFormat = [rootIndexFile, classesIndexFile, exploitsIndexFile];

  // ----------------------------------------------------
  // 1. PROCESS CLASSES FOLDER
  // ----------------------------------------------------
  const registeredClasses: string[] = [];
  if (isDirectory(classesPath)) {
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
              (name) =>
                `import ${toCamelCase(name)} from './${name}/macros.js';`,
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

    // Generate classes/macros.ts
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
  }

  // ----------------------------------------------------
  // 2. PROCESS EXPLOITS FOLDER (With Naming Fix Added)
  // ----------------------------------------------------
  const registeredDegrees: string[] = [];
  if (isDirectory(exploitsPath)) {
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

    if (registeredDegrees.length > 0) {
      // Prefixes 'degree' to guarantee variable string names pass JS token safety rules
      const exploitsImports = registeredDegrees
        .map((d) => `import degree${toCamelCase(d)} from './${d}/macros.js';`)
        .join('\n');
      const exploitsSpreads = registeredDegrees
        .map((d) => `...degree${toCamelCase(d)}`)
        .join(',\n  ');

      const exploitsContent = `import CPRMacro from 'chris-premades/macro.js';
${exploitsImports}

const macros: CPRMacro[] = [
  ${exploitsSpreads}
];

export default macros;
`;
      writeFileSync(exploitsIndexFile, exploitsContent);
      console.log(`Generated macros.ts for exploits.`);
    } else {
      writeFileSync(exploitsIndexFile, `export default [];\n`);
    }
  }

  // ----------------------------------------------------
  // 3. GENERATE ROOT ENTRYPOINT (src/scripts/macros.ts)
  // ----------------------------------------------------
  const rootImports: string[] = [];
  const rootSpreads: string[] = [];

  if (registeredClasses.length > 0) {
    rootImports.push(`import classes from './classes/macros.js';`);
    rootSpreads.push('...classes');
  }
  if (registeredDegrees.length > 0) {
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

  // 4. Clean formatting
  await formatGeneratedFiles(filesToFormat);
}

buildFromRoot();
