import { describe, expect, test } from 'bun:test'

const VALID = {
  NODE_ENV: 'development',
  PORT: '3000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  BETTER_AUTH_SECRET: 'a'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  ENCRYPTION_KEY: 'b'.repeat(32)
} as const

// `env.ts` validates process.env at import time (and exits on failure), so we
// must populate it before importing. The dynamic import runs after this line.
Object.assign(process.env, VALID)

const { env, envSchema } = await import('./env')

describe('env (exported, parsed value)', () => {
  test('coerces PORT to a number (guards the raw-env bug)', () => {
    expect(env.PORT).toBe(3000)
    expect(typeof env.PORT).toBe('number')
  })

  test('returns the parsed values', () => {
    expect(env.NODE_ENV).toBe('development')
    expect(env.DATABASE_URL).toBe(VALID.DATABASE_URL)
    expect(env.BETTER_AUTH_URL).toBe(VALID.BETTER_AUTH_URL)
  })
})

describe('envSchema validation', () => {
  test('accepts a fully valid env', () => {
    expect(envSchema.safeParse(VALID).success).toBe(true)
  })

  test('fails when a required var is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = VALID
    expect(envSchema.safeParse(rest).success).toBe(false)
  })

  test('NODE_ENV must be development | production', () => {
    expect(envSchema.safeParse({ ...VALID, NODE_ENV: 'staging' }).success).toBe(
      false
    )
  })

  test('DATABASE_URL accepts postgres:// and postgresql://', () => {
    expect(
      envSchema.safeParse({
        ...VALID,
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db'
      }).success
    ).toBe(true)
    expect(
      envSchema.safeParse({
        ...VALID,
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db'
      }).success
    ).toBe(true)
  })

  test('DATABASE_URL rejects non-postgres schemes', () => {
    expect(
      envSchema.safeParse({ ...VALID, DATABASE_URL: 'mysql://x' }).success
    ).toBe(false)
    expect(
      envSchema.safeParse({ ...VALID, DATABASE_URL: 'not-a-url' }).success
    ).toBe(false)
  })

  test('PORT coerces numeric strings and rejects non-numeric', () => {
    const ok = envSchema.safeParse({ ...VALID, PORT: '8080' })
    expect(ok.success && ok.data.PORT).toBe(8080)
    expect(envSchema.safeParse({ ...VALID, PORT: 'abc' }).success).toBe(false)
  })

  test('BETTER_AUTH_SECRET requires min length 32', () => {
    expect(
      envSchema.safeParse({ ...VALID, BETTER_AUTH_SECRET: 'tooshort' }).success
    ).toBe(false)
  })

  test('ENCRYPTION_KEY requires min length 32', () => {
    expect(
      envSchema.safeParse({ ...VALID, ENCRYPTION_KEY: 'tooshort' }).success
    ).toBe(false)
  })

  test('BETTER_AUTH_URL must be an http(s) URL', () => {
    expect(
      envSchema.safeParse({ ...VALID, BETTER_AUTH_URL: 'ftp://host' }).success
    ).toBe(false)
  })
})
