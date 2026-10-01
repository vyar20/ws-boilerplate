import { beforeEach, describe, expect, it } from 'bun:test'

// The store reads localStorage once at module load, so storage is seeded
// before the import.
localStorage.setItem('theme', 'dark')
const { themeContext } = await import('./theme-context')

beforeEach(() => themeContext.setState({ theme: 'light' }))

describe('themeContext', () => {
  it('initialises from the theme persisted in localStorage', () => {
    expect(themeContext.getInitialState().theme).toBe('dark')
  })

  it('setTheme updates state and persists it', () => {
    themeContext.getState().setTheme('dark')

    expect(themeContext.getState().theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggleTheme flips light <-> dark and persists each change', () => {
    const { toggleTheme } = themeContext.getState()

    toggleTheme()
    expect(themeContext.getState().theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    toggleTheme()
    expect(themeContext.getState().theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
