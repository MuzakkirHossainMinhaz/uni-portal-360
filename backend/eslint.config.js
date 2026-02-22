// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', '.husky/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'off', // turned off to allow typescript-eslint rule
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
