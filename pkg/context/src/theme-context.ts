import { create } from 'zustand'

export type ThemeContext = {
  theme: 'light' | 'dark'
  setTheme: (theme: ThemeContext['theme']) => void
  toggleTheme: () => void
}

export const themeContext = create<ThemeContext>((set) => ({
  theme: (localStorage?.getItem('theme') as ThemeContext['theme']) ?? 'light',
  setTheme: (theme) =>
    set(() => {
      console.log(theme)

      if (typeof window !== 'undefined') localStorage.setItem('theme', theme)
      return { theme }
    }),
  toggleTheme: () =>
    set((prevState) => {
      if (typeof window !== 'undefined')
        localStorage.setItem(
          'theme',
          prevState.theme === 'light' ? 'dark' : 'light'
        )
      return {
        theme: prevState.theme === 'light' ? 'dark' : 'light'
      }
    })
}))
