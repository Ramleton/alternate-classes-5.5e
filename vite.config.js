import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'C:/Users/ishaa/AppData/Local/FoundryVTT/Data/modules/alternate-classes-55e',
    emptyOutDir: false,
    // Use rollupOptions to control exactly how files are named
    rollupOptions: {
      input: 'src/script.ts', // Use your actual entry file
      output: {
        format: 'es',
        entryFileNames: '[name].js',
      },
    },
  },
});
