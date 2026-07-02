import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { ViteDevServer } from 'vite';
export const syncToFoundry = (foundryPath: string) => {
  const pairs = [
    { src: 'src/templates', dest: 'assets/templates', ext: '.hbs' },
    { src: 'src/styles', dest: 'assets/styles', ext: '.css' },
  ];

  // Helper function to build and sync module.json
  const syncModuleJson = async () => {
    const moduleJsonPath = path.resolve('module.json');
    if (!fs.existsSync(moduleJsonPath)) return;

    const moduleJson = JSON.parse(await fsp.readFile(moduleJsonPath, 'utf-8'));

    // Re-discover all copied CSS files and inject them dynamically
    let styleFiles: string[] = [];
    if (fs.existsSync('src/styles')) {
      styleFiles = (await fsp.readdir('src/styles'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => `assets/styles/${f}`);
    }
    moduleJson.styles = styleFiles;

    const moduleJsonOut = JSON.stringify(moduleJson, null, 2);

    // Write to dist/
    await fsp.mkdir('dist', { recursive: true });
    await fsp.writeFile(path.join('dist', 'module.json'), moduleJsonOut);

    // Write to local Foundry folder if path is set
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

      // If a new CSS file is added or removed, we need to rebuild module.json's styles array
      if (ext === '.css') {
        await syncModuleJson();
      }
    }
  };

  return {
    name: 'foundry-sync',
    configureServer(server: ViteDevServer) {
      server.watcher.add(path.resolve('module.json'));
      server.watcher.on('change', copy);
      server.watcher.on('add', copy);
      server.watcher.on('unlink', copy);
    },
    async closeBundle() {
      for (const { src, dest, ext } of pairs) {
        if (!fs.existsSync(src)) continue;
        const files = await fsp.readdir(src, { recursive: true });
        for (const file of files) {
          if (!String(file).endsWith(ext)) continue;
          const srcFile = path.join(src, String(file));
          // Copy into dist/
          const distTarget = path.join('dist', dest, String(file));
          await fsp.mkdir(path.dirname(distTarget), { recursive: true });
          await fsp.copyFile(srcFile, distTarget);
          // Copy into Foundry module folder if path is set
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
