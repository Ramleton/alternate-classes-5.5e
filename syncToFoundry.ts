import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { build, InlineConfig, ViteDevServer } from 'vite';

export const syncToFoundry = (
  foundryPath: string,
  viteConfig?: InlineConfig,
) => {
  const pairs = [
    { src: 'src/templates', dest: 'assets/templates', ext: '.hbs' },
    { src: 'src/styles', dest: 'assets/styles', ext: '.css' },
  ];

  let rebuilding = false;

  const rebuildScripts = async () => {
    if (rebuilding) return;
    rebuilding = true;
    try {
      console.log('[foundry-sync] Script change detected, rebuilding...');
      await build({ ...viteConfig, logLevel: 'silent' });

      // Copy script.js
      const scriptSrc = path.join('dist', 'script.js');
      if (foundryPath && fs.existsSync(scriptSrc)) {
        await fsp.copyFile(scriptSrc, path.join(foundryPath, 'script.js'));
        console.log('[foundry-sync] script.js rebuilt and synced.');
      }

      // Copy any rebuilt hook files
      if (foundryPath && fs.existsSync(path.join('dist', 'hooks'))) {
        const hookFiles = await fsp.readdir(path.join('dist', 'hooks'));
        for (const file of hookFiles) {
          if (!file.endsWith('.js')) continue;
          await fsp.copyFile(
            path.join('dist', 'hooks', file),
            path.join(foundryPath, 'hooks', file),
          );
        }
      }

      await syncModuleJson();
    } finally {
      rebuilding = false;
    }
  };

  let rebuildTimeout: ReturnType<typeof setTimeout> | null = null;
  const debouncedRebuild = () => {
    if (rebuildTimeout) clearTimeout(rebuildTimeout);
    rebuildTimeout = setTimeout(rebuildScripts, 300);
  };

  const getHookModules = async (): Promise<string[]> => {
    const hooksOutDir = path.join(foundryPath, 'hooks');
    if (!fs.existsSync(hooksOutDir)) return [];
    return (await fsp.readdir(hooksOutDir))
      .filter((f) => f.endsWith('.js'))
      .map((f) => `hooks/${f}`);
  };

  const syncModuleJson = async () => {
    const moduleJsonPath = path.resolve('module.json');
    if (!fs.existsSync(moduleJsonPath)) return;

    const moduleJson = JSON.parse(await fsp.readFile(moduleJsonPath, 'utf-8'));

    let styleFiles: string[] = [];
    if (fs.existsSync('src/styles')) {
      styleFiles = (await fsp.readdir('src/styles'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => `assets/styles/${f}`);
    }
    moduleJson.styles = styleFiles;

    const hookModules = await getHookModules();
    moduleJson.esmodules = ['script.js', ...hookModules];

    const moduleJsonOut = JSON.stringify(moduleJson, null, 2);

    if (foundryPath) {
      await fsp.writeFile(path.join(foundryPath, 'module.json'), moduleJsonOut);
    }
    console.log('[foundry-sync] module.json updated and synced.');
  };

  const copy = async (filePath: string) => {
    const resolvedPath = path.resolve(filePath);
    if (resolvedPath === path.resolve('module.json')) {
      await syncModuleJson();
      return;
    }
    for (const { src, dest, ext } of pairs) {
      if (!filePath.startsWith(path.resolve(src)) || !filePath.endsWith(ext))
        continue;
      const relative = path.relative(path.resolve(src), filePath);
      const target = path.join(dest, relative);
      await fsp.mkdir(path.dirname(target), { recursive: true });
      await fsp.copyFile(filePath, target);
      if (foundryPath) {
        const foundryTarget = path.join(foundryPath, dest, relative);
        await fsp.mkdir(path.dirname(foundryTarget), { recursive: true });
        await fsp.copyFile(filePath, foundryTarget);
      }
      console.log(`[foundry-sync] ${relative} → ${dest}`);
      if (ext === '.css') {
        await syncModuleJson();
      }
    }
  };

  return {
    name: 'foundry-sync',
    configureServer(server: ViteDevServer) {
      server.watcher.add(path.resolve('module.json'));
      server.watcher.add(path.resolve('src/scripts'));
      server.watcher.add(path.resolve('src/hooks'));
      server.watcher.add(path.resolve('src/script.ts'));

      const isScriptChange = (filePath: string) => {
        const normalized = path.resolve(filePath).toLowerCase();
        return (
          normalized.includes(path.join('src', 'scripts').toLowerCase()) ||
          normalized.includes(path.join('src', 'hooks').toLowerCase()) ||
          normalized === path.resolve('src/script.ts').toLowerCase()
        );
      };

      server.watcher.on('change', (filePath) => {
        if (isScriptChange(filePath)) {
          debouncedRebuild();
        } else {
          copy(filePath);
        }
      });
      server.watcher.on('add', (filePath) => {
        if (isScriptChange(filePath)) {
          debouncedRebuild();
        } else {
          copy(filePath);
        }
      });
      server.watcher.on('unlink', copy);
    },
    async closeBundle() {
      for (const { src, dest, ext } of pairs) {
        if (!fs.existsSync(src)) continue;
        const files = await fsp.readdir(src, { recursive: true });
        for (const file of files) {
          if (!String(file).endsWith(ext)) continue;
          const srcFile = path.join(src, String(file));
          const distTarget = path.join('dist', dest, String(file));
          await fsp.mkdir(path.dirname(distTarget), { recursive: true });
          await fsp.copyFile(srcFile, distTarget);
          if (foundryPath) {
            const foundryTarget = path.join(foundryPath, dest, String(file));
            await fsp.mkdir(path.dirname(foundryTarget), { recursive: true });
            await fsp.copyFile(srcFile, foundryTarget);
          }
        }
      }
      console.log('[foundry-sync] Templates and styles synced.');
      await syncModuleJson();
    },
  };
};
