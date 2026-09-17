import { beforeAll, describe, expect, it } from 'bun:test'

// `env.ts` validates `process.env` with an IIFE at import time and calls
// `process.exit(1)` on failure, so the environment must be populated with a
// valid set of variables *before* the module is imported.
const VALID_ENV = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/mydb',
  PORT: '3000', // string on purpose: it should be coerced to a number
  BETTER_AUTH_SECRET: 'a'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  ENCRYPTION_KEY: 'b'.repeat(32)
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let env: any

beforeAll(async () => {
  Object.assign(process.env, VALID_ENV)
  ;({ env } = await import('./env'))
})

describe('env (valid environment)', () => {
  it('parses successfully and exposes every variable', () => {
    expect(env.NODE_ENV).toBe('development')
    expect(env.DATABASE_URL).toBe(VALID_ENV.DATABASE_URL)
    expect(env.BETTER_AUTH_URL).toBe(VALID_ENV.BETTER_AUTH_URL)
    expect(env.BETTER_AUTH_SECRET).toBe(VALID_ENV.BETTER_AUTH_SECRET)
    expect(env.ENCRYPTION_KEY).toBe(VALID_ENV.ENCRYPTION_KEY)
  })

  it('coerces PORT from a string into a number', () => {
    expect(typeof env.PORT).toBe('number')
    expect(env.PORT).toBe(3000)
  })
})
