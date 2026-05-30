import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import ts from 'typescript-eslint';

export default [
  {
    ignores: [
      'node_modules/**',
      'subrepos/**',
    ],
  },
  ...ts.configs.recommended,
  ...ts.configs.stylistic,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true, // Set to false if you prefer no semicolons
  }),
  {
    files: ['./src/**/*.{js,mjs,cjs,ts,.d.ts}'],
    plugins: { ts, '@stylistic': stylistic },
    languageOptions: { globals: globals.browser },
    rules: {
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      '@stylistic/max-len': ['error', {
        code: 80,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
        // ADD THESE THREE EXCLUSIONS TO BREAK THE CIRCULAR LOOP:
        ignoreTrailingComments: true,
        ignoreComments: true,
      }],
    },
  },
];
