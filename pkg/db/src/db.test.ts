import { describe, expect, it, mock } from 'bun:test'

// The Prisma client (`./generated/client`), the pg adapter and `@repo/env` are
// all external to the unit under test — the singleton wiring in `db.ts`. They
// are mocked so the test needs no generated client and no real database.
const DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'

class FakePrismaPg {
  opts: unknown
  constructor(opts: unknown) {
    this.opts = opts
  }
}

let clientConstructCount = 0

class FakePrismaClient {
  opts: { adapter: unknown; log: unknown }
  constructor(opts: { adapter: unknown; log: unknown }) {
    this.opts = opts
    clientConstructCount++
  }
}

mock.module('@repo/env', () => ({
  env: { DATABASE_URL, NODE_ENV: 'development' }
}))
mock.module('@prisma/adapter-pg', () => ({ PrismaPg: FakePrismaPg }))
mock.module('./generated/client', () => ({ PrismaClient: FakePrismaClient }))

const { db } = await import('./db')

describe('db singleton', () => {
  it('constructs a single Prisma client', () => {
    expect(db).toBeInstanceOf(FakePrismaClient)
    expect(clientConstructCount).toBe(1)
  })

  it('wires the pg adapter with the DATABASE_URL from env', () => {
    const { adapter } = (db as unknown as FakePrismaClient).opts

    expect(adapter).toBeInstanceOf(FakePrismaPg)
    expect((adapter as FakePrismaPg).opts).toEqual({
      connectionString: DATABASE_URL
    })
  })

  it('enables warn/error logging in development', () => {
    expect((db as unknown as FakePrismaClient).opts.log).toEqual([
      'warn',
      'error'
    ])
  })

  it('caches the instance on globalThis in development', () => {
    expect((globalThis as unknown as { db: unknown }).db).toBe(db)
  })
})
