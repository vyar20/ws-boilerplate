import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import path from 'node:path'

// The Prisma client is generated output (gitignored). These tests only run
// once it exists — run `bun run db:gen` first. On a fresh clone they skip
// instead of failing the whole suite.
const clientGenerated = existsSync(
  path.resolve(import.meta.dir, './generated/client.ts')
)

const describeDb = clientGenerated ? describe : describe.skip

describeDb('db', () => {
  // db.ts imports @repo/env, which validates process.env at load time.
  Object.assign(process.env, {
    NODE_ENV: 'development',
    PORT: '3000',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    BETTER_AUTH_SECRET: 'a'.repeat(32),
    BETTER_AUTH_URL: 'http://localhost:3000',
    ENCRYPTION_KEY: 'b'.repeat(32)
  })

  test('exposes a PrismaClient with the expected model delegates', async () => {
    const { db } = await import('./db')

    expect(db).toBeDefined()
    expect(typeof db.$connect).toBe('function')
    expect(typeof db.$disconnect).toBe('function')
    expect(db.user).toBeDefined()
    expect(db.session).toBeDefined()
    expect(db.account).toBeDefined()
    expect(db.verification).toBeDefined()

    // No queries are issued, so this just tears down the (unused) pool.
    await db.$disconnect()
  })

  test('reuses a single client instance (singleton)', async () => {
    const first = (await import('./db')).db
    const second = (await import('./db')).db

    expect(first).toBe(second)
  })
})
