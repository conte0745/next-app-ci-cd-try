import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // 未使用変数の警告を有効化
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      // console.logの警告
      'no-console': 'warn',
      // 型安全性の向上
      '@typescript-eslint/no-explicit-any': 'warn',
      // React Hooksのルール
      'react-hooks/exhaustive-deps': 'warn',
      // 不要なセミコロンの削除
      'semi': ['error', 'always'],
      // インデントの統一
      'indent': ['error', 2],
      // 引用符の統一
      'quotes': ['error', 'single'],
      // 末尾カンマの統一
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      // console.logの警告
      'no-console': 'warn',
      // 不要なセミコロンの削除
      'semi': ['error', 'always'],
      // インデントの統一
      'indent': ['error', 2],
      // 引用符の統一
      'quotes': ['error', 'single'],
      // 末尾カンマの統一
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // テストファイルではconsole.logを許可
      'no-console': 'off',
      // テストファイルではanyを許可
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
