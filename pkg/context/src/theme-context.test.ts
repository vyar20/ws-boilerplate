import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { getInitialTheme, themeContext } from './theme-context'

const realMatchMedia = window.matchMedia

const preferDark = (dark: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: dark && query === '(prefers-color-scheme: dark)',
    media: query
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  localStorage.clear()
  themeContext.setState({ theme: 'light' })
})

afterEach(() => {
  window.matchMedia = realMatchMedia
})

describe('getInitialTheme', () => {
  it('uses a valid stored theme over the system preference', () => {
    localStorage.setItem('theme', 'dark')
    preferDark(false)

    expect(getInitialTheme()).toBe('dark')
  })

  it('ignores an invalid stored value and follows the system preference', () => {
    localStorage.setItem('theme', 'purple')
    preferDark(true)

    expect(getInitialTheme()).toBe('dark')
  })

  it('follows a dark system preference when nothing is stored', () => {
    preferDark(true)

    expect(getInitialTheme()).toBe('dark')
  })

  it('falls back to light when the system prefers light', () => {
    preferDark(false)

    expect(getInitialTheme()).toBe('light')
  })

  it('falls back to light when matchMedia is unavailable', () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia

    expect(getInitialTheme()).toBe('light')
  })
})

describe('themeContext', () => {
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

describe('without a window', () => {
  it('can be imported and defaults to light', async () => {
    // A fresh Bun process has no happy-dom preload, so window is undefined.
    const proc = Bun.spawn(
      [
        'bun',
        '-e',
        `const m = await import(${JSON.stringify(import.meta.dir + '/theme-context.ts')});` +
          `console.log(typeof window, m.themeContext.getState().theme)`
      ],
      { stdout: 'pipe', stderr: 'pipe' }
    )

    const out = await new Response(proc.stdout).text()
    expect(await proc.exited).toBe(0)
    expect(out.trim()).toBe('undefined light')
  })
})
