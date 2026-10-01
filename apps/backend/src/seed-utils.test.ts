import { passwordSchema } from '@repo/validations/sign-in-validation'
import { describe, expect, it } from 'bun:test'
import { assertSeedAllowed, generateSeedPassword } from './seed-utils'

const url = (host: string) => `postgresql://admin:s3cret-pw@${host}:5432/app`

describe('assertSeedAllowed', () => {
  it.each(['localhost', '127.0.0.1', '[::1]'])('allows %s', (host) => {
    expect(assertSeedAllowed(url(host), undefined)).toBe(host)
  })

  it('rejects a remote host', () => {
    expect(() =>
      assertSeedAllowed(url('db.prod.example.com'), undefined)
    ).toThrow(/db\.prod\.example\.com/)
  })

  it('never puts the credentials in the error message', () => {
    try {
      assertSeedAllowed(url('db.prod.example.com'), undefined)
      throw new Error('expected a rejection')
    } catch (e) {
      expect((e as Error).message).not.toContain('s3cret-pw')
      expect((e as Error).message).not.toContain('admin')
    }
  })

  it('allows a remote host when ALLOW_SEED=true', () => {
    expect(assertSeedAllowed(url('db.staging.example.com'), 'true')).toBe(
      'db.staging.example.com'
    )
  })

  it.each(['1', 'yes', 'TRUE', ''])(
    'only treats the exact string "true" as opt-in (%p)',
    (value) => {
      expect(() =>
        assertSeedAllowed(url('db.staging.example.com'), value)
      ).toThrow()
    }
  )

  it.each([undefined, '', 'not a url', 'postgresql://'])(
    'rejects a missing or invalid URL (%p)',
    (value) => {
      expect(() => assertSeedAllowed(value, 'true')).toThrow(/DATABASE_URL/)
    }
  )
})

describe('generateSeedPassword', () => {
  it('always satisfies passwordSchema', () => {
    for (let i = 0; i < 50; i++) {
      const password = generateSeedPassword()
      expect(passwordSchema.safeParse(password).success).toBe(true)
    }
  })

  it('honours the requested length', () => {
    expect(generateSeedPassword(32)).toHaveLength(32)
  })

  it('does not repeat itself', () => {
    const passwords = new Set(
      Array.from({ length: 50 }, () => generateSeedPassword())
    )
    expect(passwords.size).toBe(50)
  })
})
