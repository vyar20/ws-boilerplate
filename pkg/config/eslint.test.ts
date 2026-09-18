import { describe, expect, it } from 'bun:test'
import eslintConfig from './eslint'

describe('eslint config', () => {
  it('is a non-empty flat-config array', () => {
    expect(Array.isArray(eslintConfig)).toBe(true)
    expect(eslintConfig.length).toBeGreaterThan(0)
  })

  it('enforces consistent inline type imports', () => {
    const hasTypeImportRule = eslintConfig.some(
      (entry) =>
        entry &&
        typeof entry === 'object' &&
        'rules' in entry &&
        entry.rules?.['@typescript-eslint/consistent-type-imports']
    )

    expect(hasTypeImportRule).toBe(true)
  })

  it('ignores underscore-prefixed unused vars/args', () => {
    const unusedVarsRule = eslintConfig
      .flatMap((entry) =>
        entry && typeof entry === 'object' && 'rules' in entry
          ? [entry.rules?.['@typescript-eslint/no-unused-vars']]
          : []
      )
      .find(Boolean)

    expect(unusedVarsRule).toEqual([
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ])
  })
})
