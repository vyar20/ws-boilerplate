import type { RouteObject } from 'react-router'
import { Dashboard } from './dashboard'
import { Root } from './root'

export const router: RouteObject[] = [
  {
    path: '/',
    element: <Root />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  }
]
