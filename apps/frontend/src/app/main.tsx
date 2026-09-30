import { ReactQueryProvider } from '@/components/react-query-provider'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import { Toaster } from '@/components/ui/toast'
import '@/styles/globals.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router'
import { router } from './router'

const AppRoutes = () => useRoutes(router)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ReactQueryProvider>
          <AppRoutes />
          <Toaster />
        </ReactQueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
