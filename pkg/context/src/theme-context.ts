import { create } from 'zustand'

export type Theme = 'light' | 'dark'

export type ThemeContext = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'theme'

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark'

// Stored value first (only if valid), then the OS preference, then light.
// Guarded so the module can be imported where there is no window (SSR, tests).
export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (isTheme(stored)) return stored

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const themeContext = create<ThemeContext>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined')
      window.localStorage.setItem(STORAGE_KEY, theme)
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light')
}))
