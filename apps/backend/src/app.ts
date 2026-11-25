import { env } from '@repo/env'
import { HTTPStatus } from '@repo/utils/client-utils'
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/health', (c) =>
  c.json({
    status: 'OK',
    timestamp: Date.now()
  })
)

app.all('/api/*', (c) => c.text(HTTPStatus.NOT_FOUND))

export default {
  port: env.PORT,
  fetch: app.fetch
}
