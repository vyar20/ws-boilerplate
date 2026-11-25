import { serverAuth } from '@repo/auth/server-auth'
import { type Logger } from '@repo/utils/server-utils'
import { createMiddleware } from 'hono/factory'

export type HonoEnv = {
  Variables: {
    session: typeof serverAuth.$Infer.Session | null
    logger: Logger
  }
}

export const sessionMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const session = await serverAuth.api.getSession({
    headers: c.req.raw.headers
  })

  c.set('session', session)

  await next()
})
