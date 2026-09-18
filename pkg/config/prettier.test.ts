import { describe, expect, it } from 'bun:test'
import prettierConfig from './prettier'

describe('prettier config', () => {
  it('exposes the shared formatting rules', () => {
    expect(prettierConfig.printWidth).toBe(80)
    expect(prettierConfig.tabWidth).toBe(2)
    expect(prettierConfig.singleQuote).toBe(true)
    expect(prettierConfig.jsxSingleQuote).toBe(true)
    expect(prettierConfig.semi).toBe(false)
    expect(prettierConfig.trailingComma).toBe('none')
  })

  it('registers the tailwind plugin', () => {
    expect(Array.isArray(prettierConfig.plugins)).toBe(true)
    expect(prettierConfig.plugins).toHaveLength(1)
    expect(String(prettierConfig.plugins?.[0])).toContain(
      'prettier-plugin-tailwindcss'
    )
  })
})
