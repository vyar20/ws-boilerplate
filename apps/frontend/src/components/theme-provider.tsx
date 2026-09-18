import { themeContext } from '@repo/context/theme-context'
import { useEffect, type FC, type ReactNode } from 'react'

type ThemeProviderProps = {
  children?: ReactNode
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const theme = themeContext((state) => state.theme)
  console.log({ theme })

  useEffect(
    () => document.querySelector('html')?.setAttribute('class', theme),
    [theme]
  )

  // useEffect(() => {
  //   document.documentElement.setAttribute('data-theme', theme)
  // }, [])
  return <>{children}</>
}
