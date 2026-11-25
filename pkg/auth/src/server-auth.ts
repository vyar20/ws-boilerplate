import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@repo/db'
import { betterAuth } from 'better-auth'

export const serverAuth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  advanced: {
    database: {
      joins: true
    }
  },
  emailAndPassword: {
    enabled: true
  }
})
