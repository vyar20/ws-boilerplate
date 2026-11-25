import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@repo/db'
import { env } from '@repo/env'
import { betterAuth } from 'better-auth'

// Max session 8 hours (seconds)
const sessionDuration = 1000 * 60 * 8

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
  socialProviders: {
    // Add your SSO here
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET
    },
    twitter: {
      clientId: env.BETTER_AUTH_X_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_X_CLIENT_SECRET
    }
  }
})
