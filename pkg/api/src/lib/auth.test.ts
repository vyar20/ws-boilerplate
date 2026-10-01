import { beforeEach, describe, expect, it, mock } from 'bun:test'

type NewSession = { user: { email: string; name: string } } | null
type Ctx = {
  path: string
  body?: Record<string, unknown>
  context?: { newSession: NewSession }
}
type Hook = (ctx: Ctx) => Promise<void>
type AuthConfig = {
  baseURL: string
  hooks: { before: Hook; after: Hook }
  emailAndPassword: {
    enabled: boolean
    minPasswordLength: number
    password: {
      hash: (password: string) => Promise<string>
      verify: (args: { password: string; hash: string }) => Promise<boolean>
    }
  }
}

// better-auth, Prisma and the logger are mocked so the test exercises only the
// config this package owns: the hooks and the password hashing.
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
const body = {
  email: 'john.doe@mail.com',
  password: STRONG,
  name: 'John Doe',
  callbackURL: '/secret-path'
}
const session: NewSession = {
  user: { email: 'john.doe@mail.com', name: 'John Doe' }
}

const loggedOnce = () => {
  expect(logInfo).toHaveBeenCalledTimes(1)
  return logInfo.mock.calls[0]![0] as { type: string; data: unknown }
}

const expectNoSecrets = (logged: unknown) => {
  const text = JSON.stringify(logged)
  expect(text).not.toContain(STRONG)
  expect(text).not.toContain('John Doe')
  expect(text).not.toContain('/secret-path')
}

beforeEach(() => logInfo.mockClear())

describe('auth config', () => {
  it('uses BETTER_AUTH_URL as baseURL and enables email/password', () => {
    expect(config.baseURL).toBe('http://localhost:3000')
    expect(config.emailAndPassword.enabled).toBe(true)
  })

  it('enforces a 12-character minimum at the Better Auth level', () => {
    expect(config.emailAndPassword.minPasswordLength).toBe(12)
  })
})

describe('password hashing', () => {
  it('hashes with argon2id and verifies only the right password', async () => {
    const { hash, verify } = config.emailAndPassword.password

    const hashed = await hash(STRONG)

    expect(hashed.startsWith('$argon2id$')).toBe(true)
    expect(await verify({ password: STRONG, hash: hashed })).toBe(true)
    expect(await verify({ password: 'wrong', hash: hashed })).toBe(false)
  })

  it('still verifies legacy bcrypt hashes', async () => {
    const { verify } = config.emailAndPassword.password
    const legacy = await Bun.password.hash(STRONG, {
      algorithm: 'bcrypt',
      cost: 4
    })

    expect(legacy.startsWith('$2')).toBe(true)
    expect(await verify({ password: STRONG, hash: legacy })).toBe(true)
    expect(await verify({ password: 'wrong', hash: legacy })).toBe(false)
  })
})

describe('before hook', () => {
  it('rejects sign-up with a weak password and does not log', async () => {
    await expect(
      config.hooks.before({
        path: '/sign-up/email',
        body: { ...body, password: 'weak' }
      })
    ).rejects.toBeInstanceOf(FakeAPIError)
    expect(logInfo).not.toHaveBeenCalled()
  })

  it('lets a strong sign-up password through without logging', async () => {
    await config.hooks.before({ path: '/sign-up/email', body })

    expect(logInfo).not.toHaveBeenCalled()
  })

  it('does not log sign-in attempts before they are verified', async () => {
    await config.hooks.before({ path: '/sign-in/email', body })

    expect(logInfo).not.toHaveBeenCalled()
  })
})

describe('after hook', () => {
  it('logs a successful sign-in once, with only the masked email', async () => {
    await config.hooks.after({
      path: '/sign-in/email',
      body,
      context: { newSession: session }
    })

    const logged = loggedOnce()
    expect(logged.type).toBe('USER_LOGGED_IN')
    expect(logged.data).toEqual({ email: 'j***@mail.com' })
    expectNoSecrets(logged)
  })

  it('does not log a failed sign-in', async () => {
    await config.hooks.after({
      path: '/sign-in/email',
      body,
      context: { newSession: null }
    })

    expect(logInfo).not.toHaveBeenCalled()
  })

  it('logs a successful sign-up as USER_CREATED', async () => {
    await config.hooks.after({
      path: '/sign-up/email',
      body,
      context: { newSession: session }
    })

    const logged = loggedOnce()
    expect(logged.type).toBe('USER_CREATED')
    expect(logged.data).toEqual({ email: 'j***@mail.com' })
    expectNoSecrets(logged)
  })

  it('does not log a failed sign-up', async () => {
    await config.hooks.after({
      path: '/sign-up/email',
      body,
      context: { newSession: null }
    })

    expect(logInfo).not.toHaveBeenCalled()
  })

  it('ignores other auth paths even when a session is set', async () => {
    await config.hooks.after({
      path: '/get-session',
      context: { newSession: session }
    })

    expect(logInfo).not.toHaveBeenCalled()
  })
})
