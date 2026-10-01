import { themeContext } from '@repo/context/theme-context'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'
import { ThemeProvider } from './theme-provider'

afterEach(cleanup)

describe('ThemeProvider', () => {
  it('renders children and mirrors the theme onto <html class>', () => {
    act(() => themeContext.setState({ theme: 'light' }))
    render(
      <ThemeProvider>
        <p>child</p>
      </ThemeProvider>
    )

    expect(screen.getByText('child')).toBeDefined()
    expect(document.documentElement.className).toBe('light')

    act(() => themeContext.getState().toggleTheme())

    expect(document.documentElement.className).toBe('dark')
  })
})
