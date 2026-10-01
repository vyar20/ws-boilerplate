import { beforeEach, describe, expect, it, mock } from 'bun:test'

type Ctx = { path: string; body?: Record<string, unknown> }
type AuthConfig = {
  baseURL: string
  hooks: { before: (ctx: Ctx) => Promise<void> }
  emailAndPassword: {
    enabled: boolean
    password: {
      hash: (password: string) => Promise<string>
      verify: (args: { password: string; hash: string }) => Promise<boolean>
    }
  }
}

// better-auth, Prisma and the logger are mocked so the test exercises only the
// config this package owns: the before-hook and the password hashing.
let config!: AuthConfig

class FakeAPIError extends Error {
  status: string
  constructor(status: string, body: { message: string }) {
    super(body.message)
    this.status = status
  }
}

const logInfo = mock((_obj: unknown) => {})

mock.module('better-auth', () => ({
  betterAuth: (cfg: AuthConfig) => {
    config = cfg
    return {}
  }
}))
mock.module('better-auth/api', () => ({
  APIError: FakeAPIError,
  createAuthMiddleware: (fn: unknown) => fn
}))
mock.module('@better-auth/prisma-adapter', () => ({ prismaAdapter: () => ({}) }))
mock.module('@repo/db', () => ({ db: {} }))
mock.module('@repo/env', () => ({
  env: { BETTER_AUTH_URL: 'http://localhost:3000' }
}))
mock.module('@repo/utils/logger', () => ({ logger: { info: logInfo } }))

await import('./auth')

const STRONG = 'Str0ng!Passw0rd'

beforeEach(() => logInfo.mockClear())

describe('auth config', () => {
  it('uses BETTER_AUTH_URL as baseURL and enables email/password', () => {
    expect(config.baseURL).toBe('http://localhost:3000')
    expect(config.emailAndPassword.enabled).toBe(true)
  })

  it('hashes with bcrypt and verifies only the right password', async () => {
    const { hash, verify } = config.emailAndPassword.password

    const hashed = await hash(STRONG)

    expect(hashed).not.toBe(STRONG)
    expect(hashed.startsWith('$2')).toBe(true)
    expect(await verify({ password: STRONG, hash: hashed })).toBe(true)
    expect(await verify({ password: 'wrong', hash: hashed })).toBe(false)
  })
})

describe('before hook', () => {
  const body = {
    email: 'john.doe@mail.com',
    password: STRONG,
    name: 'John Doe',
    callbackURL: '/secret-path'
  }

  it('logs sign-in with only the masked email', async () => {
    await config.hooks.before({ path: '/sign-in/email', body })

    expect(logInfo).toHaveBeenCalledTimes(1)
    const logged = logInfo.mock.calls[0]![0] as { data: unknown }
    expect(logged.data).toEqual({ email: 'j***@mail.com' })
    expect(JSON.stringify(logged)).not.toContain(STRONG)
    expect(JSON.stringify(logged)).not.toContain('John Doe')
  })

  it('logs sign-up with only the masked email', async () => {
    await config.hooks.before({ path: '/sign-up/email', body })

    expect(logInfo).toHaveBeenCalledTimes(1)
    const logged = logInfo.mock.calls[0]![0] as { data: unknown }
    expect(logged.data).toEqual({ email: 'j***@mail.com' })
    expect(JSON.stringify(logged)).not.toContain('/secret-path')
  })

  it('rejects sign-up with a weak password and does not log', async () => {
    await expect(
      config.hooks.before({
        path: '/sign-up/email',
        body: { ...body, password: 'weak' }
      })
    ).rejects.toBeInstanceOf(FakeAPIError)
    expect(logInfo).not.toHaveBeenCalled()
  })

  it('ignores other auth paths', async () => {
    await config.hooks.before({ path: '/get-session', body })

    expect(logInfo).not.toHaveBeenCalled()
  })
})
