import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@repo/db'
import { env } from '@repo/env'
import { EventLogType, maskEmail } from '@repo/utils'
import { logger } from '@repo/utils/logger'
import { passwordSchema } from '@repo/validations/sign-in-validation'
import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql'
  }),
  baseURL: env.BETTER_AUTH_URL,
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-in/email') {
        logger.info({
          type: EventLogType.USER_LOGGED_IN,
          message: 'User Login',
          data: {
            ...ctx.body,
            email: maskEmail(ctx.body?.email),
            password: '*************'
          }
        })
        return
      }
      if (ctx.path !== '/sign-up/email') return

      const result = passwordSchema.safeParse(ctx.body?.password)

      if (!result.success) {
        throw new APIError('BAD_REQUEST', {
          message: result.error.issues[0]?.message ?? 'Invalid password'
        })
      }

      logger.info({
        type: EventLogType.USER_CREATED,
        message: 'New User Created',
        data: {
          ...ctx.body,
          email: maskEmail(ctx.body?.email),
          password: '*************'
        }
      })
    })
  },
  emailAndPassword: {
    enabled: true
  }
})
