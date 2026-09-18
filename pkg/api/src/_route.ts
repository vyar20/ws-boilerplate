import { Hono } from 'hono'
import { type auth } from './lib/auth'

export type Env = {
  Variables: {
    session: typeof auth.$Infer.Session | null
  }
}

export const _route = new Hono<Env>().get('/', (c) =>
  c.json({
    message: 'Hello from hono'
  })
)

export type AppType = typeof _route
