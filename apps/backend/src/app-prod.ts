import { env } from '@repo/env'
import { serveStatic } from 'hono/bun'
import { app, frontendPath } from './app'

app.all(
  '/assets/*',
  serveStatic({
    root: frontendPath
  })
)

app.all(
  '*',
  serveStatic({
    root: frontendPath,
    path: 'index.html'
  })
)

export default {
  port: env.PORT,
  fetch: app.fetch
}
