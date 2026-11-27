import { type HonoEnv } from '@repo/api/_app'
import { serverAuth } from '@repo/auth/server-auth'
import { createMiddleware } from 'hono/factory'

export const sessionMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const session = await serverAuth.api.getSession({
    headers: c.req.raw.headers
  })

  c.set('session', session)

  await next()
})
