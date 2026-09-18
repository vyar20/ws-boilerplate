import { type Env } from '@repo/api/_route'
import { auth } from '@repo/api/auth'
import { createMiddleware } from 'hono/factory'

export const sessionMiddleware = createMiddleware<Env>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  })

  c.set('session', session)

  await next()
})
