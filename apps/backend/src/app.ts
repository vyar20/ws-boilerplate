import { _route, type Env } from '@repo/api/_route'
import { auth } from '@repo/api/auth'
import { env } from '@repo/env'
import { ErrorHandler, HTTPCode, HTTPText } from '@repo/utils'
import { logger } from '@repo/utils/logger'
import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { HTTPException } from 'hono/http-exception'
import { secureHeaders } from 'hono/secure-headers'
import { type ContentfulStatusCode } from 'hono/utils/http-status'
import path from 'node:path'
import { sessionMiddleware } from './middleware/auth-middleware'
import { isAuthenticatedMiddleware } from './middleware/is-authenticated-middleware'

const app = new Hono<Env>()

export const frontendPath = path.resolve(
  import.meta.dirname,
  env.NODE_ENV === 'development' ? '../../frontend' : '../../frontend/dist'
)

app.use('*', secureHeaders())
// Rejects cross-site form-style writes (form/multipart/text/plain bodies) by
// Origin / Sec-Fetch-Site. Cross-origin JSON is already stopped by the CORS
// preflight, since no CORS is enabled.
app.use('/api/*', csrf())
app.use('/api/*', sessionMiddleware)
app.all('/api/auth/*', (c) => auth.handler(c.req.raw))
app.use('/api/*', isAuthenticatedMiddleware)
app.route('/api', _route)
// Registered after the API router so _route stays free of ordering rules and
// AppType has no catch-all. Also keeps unknown /api paths from falling through
// to the SPA's index.html in production.
app.all('/api/*', (c) =>
  c.json({ message: HTTPText.NOT_FOUND }, HTTPCode.NOT_FOUND)
)

app.onError((err, c) => {
  // Middleware such as csrf() rejects with an HTTPException carrying its own
  // response (e.g. 403); keep it instead of masking it as a 500.
  if (err instanceof HTTPException) {
    const log = err.status < 500 ? logger.warn : logger.error
    log.call(logger, {
      message: err.message,
      status: err.status,
      path: c.req.path
    })
    return err.getResponse()
  }

  if (err instanceof ErrorHandler) {
    // 4xx are client mistakes (bad input, no session): warn, don't page anyone.
    const log = err.code < 500 ? logger.warn : logger.error
    log.call(logger, {
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
