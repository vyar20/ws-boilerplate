import { ReactQueryProvider } from '@/components/react-query-provider'
import { SessionProvider } from '@/components/session-provider'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import { Toaster } from '@/components/ui/toast'
import '@/styles/globals.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, type RouteObject } from 'react-router'
import { router } from './router'

const renderRoutes = (routes: RouteObject[]) => {
  return routes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ReactQueryProvider>
          <SessionProvider>
            <Routes>
              {router.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                >
                  {route.children && renderRoutes(route.children)}
                </Route>
              ))}
            </Routes>
            <Toaster />
          </SessionProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
