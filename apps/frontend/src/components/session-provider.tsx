import { useSession } from '@repo/react-query/auth/use-session'
import { useEffect, type FC, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'

type SessionProps = {
  children?: ReactNode
}

export const SessionProvider: FC<SessionProps> = ({ children }) => {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!isPending) {
      if (!session && pathname !== '/') navigate('/')
      if (session && pathname !== '/dashboard') navigate('/dashboard')
    }
  }, [isPending, session, pathname, navigate])

  return children
}
