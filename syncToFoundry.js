import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
export const syncToFoundry = (foundryPath) => {
  const pairs = [
    { src: 'src/templates', dest: 'assets/templates', ext: '.hbs' },
    { src: 'src/styles', dest: 'assets/styles', ext: '.css' },
  ];

  const copy = async (filePath) => {
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
    }
  };

  return {
    name: 'foundry-sync',
    configureServer(server) {
      server.watcher.on('change', copy);
      server.watcher.on('add', copy);
    },
    async closeBundle() {
      await fsp.copyFile(
        path.resolve('module.json'),
        path.join('dist', 'module.json'),
      );
      if (foundryPath) {
        await fsp.copyFile(
          path.resolve('module.json'),
          path.join(foundryPath, 'module.json'),
        );
      }
      console.log('[foundry-sync] module.json synced.');
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
    },
  };
};
