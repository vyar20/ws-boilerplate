import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { MemoryRouter, Route, Routes, type InitialEntry } from 'react-router'

let sessionState: { data: unknown; isPending: boolean }

mock.module('@repo/react-query/auth/use-session', () => ({
  useSession: () => sessionState
}))

const { ProtectedRoute, PublicOnlyRoute } = await import('./auth-guard')

afterEach(cleanup)

const renderAt = (entry: InitialEntry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path='/' element={<p>sign-in page</p>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<p>dashboard page</p>} />
          <Route path='/settings' element={<p>settings page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

const signedIn = { data: { user: { id: 'u1' } }, isPending: false }
const signedOut = { data: null, isPending: false }

describe('ProtectedRoute', () => {
  it('shows a loader while the session is loading', () => {
    sessionState = { data: undefined, isPending: true }
    renderAt('/dashboard')

    expect(screen.getByText('Loading…')).toBeDefined()
  })

  it('redirects to / when signed out', () => {
    sessionState = signedOut
    renderAt('/dashboard')

    expect(screen.getByText('sign-in page')).toBeDefined()
    expect(screen.queryByText('dashboard page')).toBeNull()
  })

  it('renders the page when signed in', () => {
    sessionState = signedIn
    renderAt('/dashboard')

    expect(screen.getByText('dashboard page')).toBeDefined()
  })
})

describe('PublicOnlyRoute', () => {
  it('renders the page when signed out', () => {
    sessionState = signedOut
    renderAt('/')

    expect(screen.getByText('sign-in page')).toBeDefined()
  })

  it('sends a signed-in user to /dashboard by default', () => {
    sessionState = signedIn
    renderAt('/')

    expect(screen.getByText('dashboard page')).toBeDefined()
  })

  it('sends a signed-in user back to the page they came from', () => {
    sessionState = signedIn
    renderAt({
      pathname: '/',
      state: { from: { pathname: '/settings', search: '', hash: '' } }
    })

    expect(screen.getByText('settings page')).toBeDefined()
  })
})
