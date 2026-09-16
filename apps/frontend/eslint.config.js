import js from '@eslint/js'
import base from '@repo/config/eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      globals: globals.browser
    }
  },
  base,
  {
    // Enforce the client/server boundary: server-only workspace packages must
    // never be imported from frontend code, or their transitive deps (Prisma,
    // pino, better-auth server config, env secrets) would end up in the browser
    // bundle. `@repo/api/_route` is allowed as a *type* import only (for AppType).
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/db',
              message: 'Server-only (Prisma). Do not import from the frontend.'
            },
            {
              name: '@repo/env',
              message:
                'Holds server env/secrets. Use import.meta.env on the client.'
            },
            {
              name: '@repo/api/auth',
              message:
                'Server-only (better-auth + db). Do not import from the frontend.'
            },
            {
              name: '@repo/utils/logger',
              message:
                'Server-only (pino/node). Do not import from the frontend.'
            },
            {
              name: '@repo/api/_route',
              allowTypeImports: true,
              message:
                'Server-only route. Import as a type only: import type { AppType }.'
            }
          ]
        }
      ]
    }
  },
  {
    // shadcn/base-ui components export their variants (e.g. buttonVariants)
    // alongside the component. That's an intentional pattern here, so relax the
    // Fast Refresh rule for the generated UI primitives only.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off'
    }
  }
])
