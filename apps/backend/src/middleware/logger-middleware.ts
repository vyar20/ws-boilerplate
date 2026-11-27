import { logger } from '@repo/utils/server-utils'
import { createMiddleware } from 'hono/factory'

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const method = c.req.method
  const url = c.req.path
  const requestId = crypto.randomUUID()
  const start = performance.now()

  const requestLogger = logger.child({
    requestId,
    method,
    url
  })

  c.set('logger', requestLogger)
  c.set('requestId', requestId)
  c.header('X-Request-ID', requestId)

  requestLogger.debug(
    {
      event: 'http.request.started'
    },
    'Incoming request'
  )

  await next()

  const duration = Number((performance.now() - start).toFixed(2))

  const status = c.res.status

  const level = status > 499 ? 'error' : status >= 400 ? 'warn' : 'info'

  requestLogger[level]({
    event: 'http.request.completed',
    status,
    duration
  })
})
