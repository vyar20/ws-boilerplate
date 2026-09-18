import { type Env } from '@repo/api/_route'
import { ErrorHandler, HTTPText } from '@repo/utils'
import { createMiddleware } from 'hono/factory'

export const isAuthenticatedMiddlware = createMiddleware<Env>(
  async (c, next) => {
    const session = c.get('session')

    if (!session)
      throw new ErrorHandler(
        HTTPText.UNAUTHORIZED,
        'UNAUTHORIZED',
        HTTPText.UNAUTHORIZED
      )

    await next()
  }
)
