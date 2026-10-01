import { HTTPCode, HTTPText } from '@repo/utils'
import { Hono } from 'hono'
import { type auth } from './lib/auth'

export type Env = {
  Variables: {
    session: typeof auth.$Infer.Session | null
  }
}

export const _route = new Hono<Env>()
  .get('/', (c) =>
    c.json({
      message: 'Hello from hono'
    })
  )
  // Must stay last: Hono runs handlers in registration order, so routes added
  // after this are unreachable. Also stops unknown /api paths falling through
  // to the SPA's index.html in production.
  .all('*', (c) =>
    c.json({ message: HTTPText.NOT_FOUND }, HTTPCode.NOT_FOUND)
  )

export type AppType = typeof _route
