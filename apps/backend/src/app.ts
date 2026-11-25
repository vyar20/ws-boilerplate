import { Hono } from 'hono'

const app = new Hono()

app.get('/api', (c) =>
  c.json({
    message: 'ok'
  })
)

export default {
  port: 3000,
  fetch: app.fetch
}
