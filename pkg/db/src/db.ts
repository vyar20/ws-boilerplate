import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@repo/env'
import { PrismaClient } from './generated/client'

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
})

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : []
  })

if (env.NODE_ENV === 'development') globalForPrisma.db = db
