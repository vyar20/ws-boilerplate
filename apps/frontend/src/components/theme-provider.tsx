import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps
} from 'next-themes'
import type { FC } from 'react'

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  return (
    <NextThemeProvider attribute='class' enableSystem defaultTheme='system'>
      {children}
    </NextThemeProvider>
  )
}
