import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@repo/db'
import { env } from '@repo/env'
import { EventLogType, maskEmail } from '@repo/utils'
import { logger } from '@repo/utils/logger'
import { passwordSchema } from '@repo/validations/sign-in-validation'
import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'

const SUCCESS_EVENTS: Record<
  string,
  { type: keyof typeof EventLogType; message: string } | undefined
> = {
  '/sign-in/email': {
    type: EventLogType.USER_LOGGED_IN,
    message: 'User Login'
  },
  '/sign-up/email': {
    type: EventLogType.USER_CREATED,
    message: 'New User Created'
  }
}

// Unset: keep Better Auth's default IP headers. Set: trust only the header our
// own proxy writes, so clients cannot pick their rate-limit key.
export const ipAddressOptions = (header: string | undefined) =>
  header ? { ipAddress: { ipAddressHeaders: [header] } } : undefined

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql'
  }),
  baseURL: env.BETTER_AUTH_URL,
  // Counters live in Postgres (rateLimit table) so every instance shares them;
  // in-memory counters would reset per process. Better Auth enables rate
  // limiting in production only by default.
  rateLimit: {
    storage: 'database'
  },
  advanced: ipAddressOptions(env.TRUSTED_PROXY_IP_HEADER),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return

      const result = passwordSchema.safeParse(ctx.body?.password)

      if (!result.success) {
        throw new APIError('BAD_REQUEST', {
          message: result.error.issues[0]?.message ?? 'Invalid password'
        })
      }
    }),
    // After hooks also run when the endpoint failed, so only a freshly created
    // session counts as success. Log fields are an allowlist: never spread the body.
    after: createAuthMiddleware(async (ctx) => {
      const event = SUCCESS_EVENTS[ctx.path]
      const newSession = ctx.context.newSession

      if (!event || !newSession) return

      logger.info({
        ...event,
        data: { email: maskEmail(newSession.user.email) }
      })
    })
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    password: {
      // Bun defaults to argon2id and detects the algorithm from the hash on
      // verify, so existing bcrypt hashes keep working.
      hash: (password) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash)
    }
  }
})
