import { _app, type HonoEnv } from '@repo/api/_app'
import { serverAuth } from '@repo/auth/server-auth'
import { env } from '@repo/env'
import { logger } from '@repo/utils/server-utils'
import { Hono } from 'hono'
import { loggerMiddleware } from './middleware/logger-middleware'
import { sessionMiddleware } from './middleware/session-middleware'

const app = new Hono<HonoEnv>()

app.use(loggerMiddleware)
app.all('/api/auth/*', (c) => serverAuth.handler(c.req.raw))
app.use(sessionMiddleware)
app.route('/api', _app)

app.onError((err, c) => {
  const log = c.get('logger') ?? logger

  log.error(
    {
      err,
      event: 'http.request.failed'
    },
    err.message
  )

  return c.json(
    {
      ok: false,
      message: 'Internal Server Error'
    },
    500
  )
})

export default {
  port: env.PORT,
  fetch: app.fetch
}
