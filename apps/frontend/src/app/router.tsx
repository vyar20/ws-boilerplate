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
      // Halaman baru yang butuh login cukup ditambah di sini, contoh:
      // { path: '/settings', element: <Settings /> }
    ]
  },
  { path: '*', element: <NotFound /> }
]
