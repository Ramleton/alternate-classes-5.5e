import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { syncToFoundry } from './syncToFoundry.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const foundryPath = env.FOUNDRY_MODULE_PATH;

  return {
    plugins: [tsconfigPaths(), syncToFoundry(foundryPath)],
    build: {
      outDir: foundryPath,
      emptyOutDir: false,
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
