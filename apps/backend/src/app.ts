import { serverAuth } from '@repo/auth/server-auth'
import { db } from '@repo/db'
import { env } from '@repo/env'
import { HTTPCode, HTTPStatus, p } from '@repo/utils/client-utils'
import { formatDistanceToNow } from 'date-fns'
import { Hono } from 'hono'

const app = new Hono()
const appStartAt = Date.now()

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
app.all('/api/*', (c) => c.text(HTTPStatus.NOT_FOUND))

export default {
  port: env.PORT,
  fetch: app.fetch
}
