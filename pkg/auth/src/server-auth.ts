import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@repo/db'
import { env } from '@repo/env'
import { betterAuth } from 'better-auth'

// Max session 8 hours (seconds)
const sessionDuration = 1000 * 60 * 60 * 8

export const serverAuth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  baseURL: env.BETTER_AUTH_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: sessionDuration
  },
  advanced: {
    database: {
      joins: true
    }
  },
  /**
   * Authentication method
   * Read Better-Auth docs for more methods
   * https://better-auth.com
   */
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    // Add your SSO here
  ]
})
