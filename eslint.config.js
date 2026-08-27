import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'package-lock.json'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': hooksPlugin,
      'simple-import-sort': simpleImportSort,
      unicorn: unicornPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...hooksPlugin.configs.flat.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'no-console': 'warn',
      'object-shorthand': 'error',
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unused-imports/no-unused-imports': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
);
