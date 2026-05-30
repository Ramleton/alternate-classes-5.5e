import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import ts from 'typescript-eslint';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'subrepos/**',
      'src/**/*.d.ts',
    ],
  },
  ...ts.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    files: ['./src/**/*.{js,mjs,cjs,ts}'],
    plugins: { ts, '@stylistic': stylistic },
    languageOptions: { globals: globals.browser },
    rules: {
      'no-undef': 'off',
      'no-trailing-spaces': 'warn',
      'max-len': ['error', { code: 80, tabWidth: 2 }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
    },
  },
];
