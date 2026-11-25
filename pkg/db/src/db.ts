import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@repo/env'
import { PrismaClient } from './generated/prisma/client'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient
}

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV !== 'production' ? ['error', 'info', 'warn'] : []
  })

if (env.NODE_ENV !== 'production') globalForPrisma.db = db
