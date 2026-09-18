import js from '@eslint/js'
import { type Config, globalIgnores } from 'eslint/config'
import ts from 'typescript-eslint'

export default [
  globalIgnores(['node_modules', 'dist', '*.config.{ts,js}']),
  js.configs.recommended,
  ts.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'react-hooks/exhaustive-deps': 'off'
    }
  },
  { files: ['**/*.{js,jsx}'], rules: {} }
] as Config[]
