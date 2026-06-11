import stylistic from '@stylistic/eslint-plugin';
import nodePlugin from 'eslint-plugin-n';
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
    files: [
      './src/**/*.{js,mjs,cjs,ts,.d.ts}',
      './dist/**/*.{js}',
    ],
    plugins: { ts, '@stylistic': stylistic, 'n': nodePlugin },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: true,
      },
    },
    rules: {
      'n/file-extension-in-import': ['error', 'always'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      '@stylistic/max-len': ['error', {
        code: 80,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
        ignorePattern: '^import\\s.+\\sfrom\\s.+;$',
        // ADD THESE THREE EXCLUSIONS TO BREAK THE CIRCULAR LOOP:
        ignoreTrailingComments: true,
        ignoreComments: true,
      }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
];
