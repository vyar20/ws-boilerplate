import { _route, type Env } from '@repo/api/_route'
import { auth } from '@repo/api/auth'
import { env } from '@repo/env'
import { ErrorHandler, HTTPCode, HTTPText } from '@repo/utils'
import { logger } from '@repo/utils/logger'
import { Hono } from 'hono'
import { type ContentfulStatusCode } from 'hono/utils/http-status'
import path from 'node:path'
import { sessionMiddleware } from './middleware/auth-middleware'
import { isAuthenticatedMiddleware } from './middleware/is-authenticated-middleware'

const app = new Hono<Env>()

export const frontendPath = path.resolve(
  import.meta.dirname,
  env.NODE_ENV === 'development' ? '../../frontend' : '../../frontend/dist'
)

app.use('/api/*', sessionMiddleware)
app.all('/api/auth/*', (c) => auth.handler(c.req.raw))
app.use('/api/*', isAuthenticatedMiddleware)
app.route('/api', _route)

app.onError((err, c) => {
  if (err instanceof ErrorHandler) {
    logger.error({
      message: err.message,
      reason: err.reason
    })
    return c.json(
      {
        message: err.message
      },
      err.code as unknown as ContentfulStatusCode
    )
  }
  logger.error({
    message: err.message
  })

  return c.json(
    {
      message: HTTPText.INTERNAL_SERVER_ERROR
    },
    HTTPCode.INTERNAL_SERVER_ERROR
  )
})

export { app }
