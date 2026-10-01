import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

const signOut = mock(() => {})
let signOutPending = false

mock.module('@repo/react-query/auth/use-session', () => ({
  useSession: () => ({
    data: { user: { email: 'a@b.com' } },
    isPending: false
  })
}))
mock.module('@repo/react-query/auth/use-sign-out', () => ({
  useSignOut: () => ({ mutate: signOut, isPending: signOutPending })
}))

const { Dashboard } = await import('./dashboard')

afterEach(cleanup)
beforeEach(() => {
  signOut.mockClear()
  signOutPending = false
})

describe('Dashboard', () => {
  it('shows the signed-in user', () => {
    render(<Dashboard />)

    expect(screen.getByText(/a@b\.com/)).toBeDefined()
  })

  it('signs out when the button is clicked', () => {
    render(<Dashboard />)

    screen.getByRole('button', { name: 'Sign Out' }).click()

    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('disables the button while signing out', () => {
    signOutPending = true
    render(<Dashboard />)

    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true)
  })
})
