import { NotFound } from '@/components/not-found'
import type { RouteObject } from 'react-router'
import { ProtectedRoute, PublicOnlyRoute } from '../components/auth-guard'
import { Dashboard } from './dashboard'
import { Root } from './root'

export const router: RouteObject[] = [
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/', element: <Root /> }]
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <Dashboard /> }
      // Add new pages that require sign-in here, e.g.:
      // { path: '/settings', element: <Settings /> }
    ]
  },
  { path: '*', element: <NotFound /> }
]
