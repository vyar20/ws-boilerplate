import { useSession } from '@repo/react-query/auth/use-session'
import type { FC } from 'react'
import { Navigate, Outlet, useLocation, type Location } from 'react-router'

const FullPageLoader: FC = () => (
  <div className='text-muted-foreground flex min-h-svh items-center justify-center'>
    Loading…
  </div>
)

// Pages that require a signed-in user.
export const ProtectedRoute: FC = () => {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) return <FullPageLoader />

  // Remember where the user was headed so sign-in can send them back there.
  if (!session) return <Navigate to='/' replace state={{ from: location }} />

  return <Outlet />
}

// Pages only for users who are NOT signed in yet (sign-in / sign-up).
export const PublicOnlyRoute: FC = () => {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) return <FullPageLoader />

  if (session) {
    const from = (location.state as { from?: Location } | null)?.from

    const to = from
      ? `${from.pathname}${from.search}${from.hash}`
      : '/dashboard'
    return <Navigate to={to} replace />
  }

  return <Outlet />
}
