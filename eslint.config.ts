import eslint from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Base recommended from ESLint
  eslint.configs.recommended,

  // TypeScript recommended strict + type-checked configs
  ...tseslint.configs.recommended,

  // Prettier recommended config (disables conflicting rules)
  {
    plugins: {
      prettier,
      'unused-imports': unusedImports,
    },
    rules: {
      // Make Prettier report as ESLint errors
      'prettier/prettier': 'error',

      // Your custom rules
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'arrow-body-style': 0,
      'prefer-arrow-callback': 0,
      'prefer-template': 2,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/no-misused-promises': 0,
      '@typescript-eslint/no-redundant-type-constituents': 0,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    files: ['**/*.{ts,tsx,js}'],
    ignores: ['**/*.json', '**/*.md', '**/*.cjs', '**/*.mjs'],
  },
]);
