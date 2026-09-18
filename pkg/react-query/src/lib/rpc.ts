import { type AppType } from '@repo/api/client'
import { hc } from 'hono/client'

export const api = hc<AppType>('/api', {
  init: {
    credentials: 'include'
  }
})
