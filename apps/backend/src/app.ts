import { serverAuth } from '@repo/auth/server-auth'
import { db } from '@repo/db'
import { env } from '@repo/env'
import { HTTPCode, HTTPStatus, p } from '@repo/utils/client-utils'
import { logger } from '@repo/utils/server-utils'
import { formatDistanceToNow } from 'date-fns'
import { Hono } from 'hono'
import { loggerMiddleware } from './middleware/logger-middleware'
import {
  type HonoEnv,
  sessionMiddleware
} from './middleware/session-middleware'

const app = new Hono<HonoEnv>()
const globalAppStart = globalThis as unknown as {
  appStartAt: number
}
const appStartAt = globalAppStart.appStartAt ?? Date.now()

if (env.NODE_ENV !== 'production') globalAppStart.appStartAt = appStartAt

app.use(loggerMiddleware)
app.all('/api/auth/*', (c) => serverAuth.handler(c.req.raw))
app.get('/api/health', async (c) => {
  const [err] = await p(db.$queryRaw`SELECT 1`)

  return c.json(
    {
      status: 'OK',
      database: {
        status: err ? 'Not Connected' : 'Connected'
      },
      timestamp: Date.now(),
      upTime: formatDistanceToNow(appStartAt, {
        addSuffix: true,
        includeSeconds: true
      })
    },
    err ? HTTPCode.SERVICE_UNAVAILABLE : HTTPCode.OK
  )
})
app.use(sessionMiddleware)
app.all('/api/*', (c) => c.text(HTTPStatus.NOT_FOUND))

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
