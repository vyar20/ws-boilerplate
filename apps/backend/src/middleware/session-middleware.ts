import { serverAuth } from '@repo/auth/server-auth'
import { createMiddleware } from 'hono/factory'

type Env = {
  Variables: {
    session: typeof serverAuth.$Infer.Session | null
  }
}

export const sessionMiddleware = createMiddleware<Env>(async (c, next) => {
  const session = await serverAuth.api.getSession({
    headers: c.req.raw.headers
  })

  c.set('session', session)

  await next()
})
