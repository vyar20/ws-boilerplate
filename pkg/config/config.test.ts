import { describe, expect, test } from 'bun:test'
import base from './base.json'
import eslintConfig from './eslint'
import prettierConfig from './prettier'

describe('@repo/config prettier', () => {
  test('exposes the expected formatting rules', () => {
    expect(prettierConfig.singleQuote).toBe(true)
    expect(prettierConfig.jsxSingleQuote).toBe(true)
    expect(prettierConfig.semi).toBe(false)
    expect(prettierConfig.printWidth).toBe(80)
    expect(prettierConfig.tabWidth).toBe(2)
    expect(prettierConfig.trailingComma).toBe('none')
  })

  test('includes the tailwind plugin', () => {
    const hasTailwind = prettierConfig.plugins?.some((plugin) =>
      String(plugin).includes('prettier-plugin-tailwindcss')
    )
    expect(hasTailwind).toBe(true)
  })
})

describe('@repo/config tsconfig base', () => {
  test('enforces strict, bundler resolution', () => {
    expect(base.compilerOptions.strict).toBe(true)
    expect(base.compilerOptions.moduleResolution).toBe('bundler')
    expect(base.compilerOptions.target).toBe('esnext')
  })
})

describe('@repo/config eslint', () => {
  test('exports a non-empty flat-config array', () => {
    expect(Array.isArray(eslintConfig)).toBe(true)
    expect(eslintConfig.length).toBeGreaterThan(0)
  })
})
