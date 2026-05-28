import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'automated-conditions-5e/**',
      'chris-premades/**',
      'gambits-premades/**',
      'midi-item-showcase-community/**',
      'midi-qol/**',
    ],
  },
  stylistic.configs.customize({
    'indent': 2,
    'quotes': 'single',
    'semi': true,
    'no-extra-semi': 'error',
    'no-trailing-spaces': 'warn',
    'max-len': ['error', { code: 80, tabWidth: 2 }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
  }),
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, '@stylistic': stylistic },
    languageOptions: { globals: globals.browser },
    rules: {
      'no-undef': 'off',
    },
  },
];
