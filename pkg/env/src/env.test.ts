import { beforeAll, describe, expect, it } from 'bun:test'
import type { envSchema as EnvSchema } from './env'

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
let envSchema: typeof EnvSchema

beforeAll(async () => {
  Object.assign(process.env, VALID_ENV)
  ;({ env, envSchema } = await import('./env'))
})

const issueFor = (input: Record<string, unknown>, key: string) => {
  const result = envSchema.safeParse(input)
  return result.success
    ? undefined
    : result.error.issues.find((i) => i.path[0] === key)?.message
}

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

describe('envSchema', () => {
  it('treats ENCRYPTION_KEY as optional', () => {
    const { ENCRYPTION_KEY: _unused, ...withoutKey } = VALID_ENV

    const result = envSchema.safeParse(withoutKey)

    expect(result.success).toBe(true)
    expect(result.data?.ENCRYPTION_KEY).toBeUndefined()
  })

  it('still requires ENCRYPTION_KEY to be at least 32 chars when set', () => {
    expect(
      issueFor({ ...VALID_ENV, ENCRYPTION_KEY: 'short' }, 'ENCRYPTION_KEY')
    ).toBe('ENCRYPTION_KEY min length 32.')
  })

  it('reports missing required variables with correctly spelled messages', () => {
    expect(issueFor({ ...VALID_ENV, NODE_ENV: 'test' }, 'NODE_ENV')).toBe(
      'NODE_ENV should be one of development | production.'
    )
    expect(
      issueFor(
        { ...VALID_ENV, BETTER_AUTH_SECRET: undefined },
        'BETTER_AUTH_SECRET'
      )
    ).toBe('BETTER_AUTH_SECRET is required.')
    expect(
      issueFor({ ...VALID_ENV, BETTER_AUTH_URL: undefined }, 'BETTER_AUTH_URL')
    ).toBe('BETTER_AUTH_URL is required.')
  })
})
