import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
        },
        plugins: {
            '@typescript-eslint': ts,
        },
        rules: {
            'max-len': ['error', { 'code': 80, 'ignoreUrls': true }]
        },
    },
];