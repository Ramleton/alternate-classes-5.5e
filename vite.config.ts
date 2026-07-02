import { defineConfig, loadEnv } from 'vite';
import { syncToFoundry } from './syncToFoundry.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const foundryPath = env.FOUNDRY_MODULE_PATH;

  return {
    plugins: [syncToFoundry(foundryPath)],
    build: {
      outDir: foundryPath,
      emptyOutDir: false,
      resolve: {
        tsconfigPaths: true,
      },
      rollupOptions: {
        input: 'src/script.ts',
        output: {
          format: 'es',
          entryFileNames: '[name].js',
        },
      },
    },
  };
});
