import stylistic from '@stylistic/eslint-plugin';
import nodePlugin from 'eslint-plugin-n';
import globals from 'globals';
import ts from 'typescript-eslint';
// 1. Import the Prettier config
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/**', 'subrepos/**'],
  },
  ...ts.configs.recommended,
  ...ts.configs.stylistic,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    files: ['./src/**/*.{js,mjs,cjs,ts,.d.ts}', './dist/**/*.{js}'],
    plugins: { ts, '@stylistic': stylistic, n: nodePlugin },
    settings: {
      n: {
        resolvePaths: ['src/scripts/'],
        typescriptExtensionsMap: [
          ['.ts', '.js'],
          ['.cts', '.cjs'],
          ['.mts', '.mjs'],
        ],
      },
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: true,
      },
    },
    rules: {
      'n/file-extension-in-import': ['error', 'always'],
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

      // NOTE: Your custom @stylistic rules (like max-len, eol-last)
      // are safe to leave here, but eslint-config-prettier will
      // automatically silence any that conflict with Prettier's layout logic.
      '@stylistic/max-len': [
        'error',
        {
          code: 80,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreRegExpLiterals: true,
          ignorePattern: '^import\\s.+\\sfrom\\s.+;$',
          ignoreTrailingComments: true,
          ignoreComments: true,
        },
      ],
    },
  },
  // 2. ALWAYS PLACE THIS LAST to disable conflicting formatting rules
  eslintConfigPrettier,
];
