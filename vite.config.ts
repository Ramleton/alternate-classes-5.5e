import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { syncToFoundry } from './syncToFoundry.js';

const getHookEntries = () => {
  const hooksDir = path.resolve('src/hooks');
  if (!fs.existsSync(hooksDir)) return {};
  return Object.fromEntries(
    fs
      .readdirSync(hooksDir)
      .filter((f) => f.endsWith('.ts'))
      .map((f) => [`hooks/${path.basename(f, '.ts')}`, path.join(hooksDir, f)]),
  );
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const foundryPath = env.FOUNDRY_MODULE_PATH;

  return {
    plugins: [syncToFoundry(foundryPath)],
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      outDir: foundryPath,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          script: path.resolve('src/script.ts'),
          ...getHookEntries(),
        },
        output: {
          format: 'es',
          entryFileNames: '[name].js',
        },
      },
    },
  };
});
