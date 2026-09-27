import js from '@eslint/js';
import globals from 'globals';
import ts from 'typescript-eslint';
import { typescriptRules } from '../eslint.rules.mjs';

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
      },
    },
    rules: {
      'no-unused-vars': 'off',
      ...typescriptRules,
    },
  },
  {
    files: ['src/utils/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
