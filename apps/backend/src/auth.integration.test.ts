import { db } from '@repo/db'
import { env } from '@repo/env'
import { EventLogType } from '@repo/utils'
import { logger } from '@repo/utils/logger'
import { afterAll, beforeAll, describe, expect, it, spyOn } from 'bun:test'
import { app } from './app'

// Real Better Auth + Prisma + Postgres + env: nothing here is mocked. Run with
// `bun run test:integration` against a migrated database (see README > Testing).
// Steps share state (cookies, the created user), so they run in order.

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const EMAIL = `it-${RUN_ID}@example.com`
const PASSWORD = 'Integr4tion!Passw0rd'
const ORIGIN = new URL(env.BETTER_AUTH_URL).origin

const logInfo = spyOn(logger, 'info')

const post = (path: string, body: unknown, cookie?: string) =>
  app.request(path, {
    method: 'POST',
    // Same Origin as a browser on the app, which Better Auth checks.
    headers: {
      origin: ORIGIN,
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify(body)
  })

const getApi = (cookie: string) => app.request('/api', { headers: { cookie } })

// "name=value; name2=value2" from every Set-Cookie header.
const cookieFrom = (res: Response) =>
  res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ')

const loggedTypes = () =>
  logInfo.mock.calls.map((call) => (call[0] as { type?: string }).type)

beforeAll(() => logInfo.mockClear())

afterAll(async () => {
  logInfo.mockRestore()
  // Cascades to the user's sessions and accounts.
  await db.user.deleteMany({ where: { email: EMAIL } })
  await db.$disconnect()
})

describe('auth flow against a real database', () => {
  let sessionCookie = ''

  it('a. signs up with a strong password and returns a session cookie', async () => {
    const res = await post('/api/auth/sign-up/email', {
      name: 'Integration Test',
      email: EMAIL,
      password: PASSWORD
    })

    expect(res.status).toBe(200)
    expect(cookieFrom(res)).toContain('session_token=')
    expect(loggedTypes()).toEqual([EventLogType.USER_CREATED])
  })

  it('b. rejects sign-up with a weak password with 400', async () => {
    const res = await post('/api/auth/sign-up/email', {
      name: 'Weak',
      email: `weak-${RUN_ID}@example.com`,
      password: 'weak'
    })

    expect(res.status).toBe(400)
    expect(
      await db.user.count({ where: { email: `weak-${RUN_ID}@example.com` } })
    ).toBe(0)
  })

  it('c. rejects a second sign-up with the same email', async () => {
    const res = await post('/api/auth/sign-up/email', {
      name: 'Duplicate',
      email: EMAIL,
      password: PASSWORD
    })

    expect(res.ok).toBe(false)
    expect(await db.user.count({ where: { email: EMAIL } })).toBe(1)
  })

  it('d. rejects sign-in with a wrong password', async () => {
    const res = await post('/api/auth/sign-in/email', {
      email: EMAIL,
      password: 'Wrong!Passw0rd-123'
    })

    expect(res.status).toBe(401)
    expect(cookieFrom(res)).not.toContain('session_token=')
  })

  it('e. signs in with the right password and returns a session cookie', async () => {
    const res = await post('/api/auth/sign-in/email', {
      email: EMAIL,
      password: PASSWORD
    })

    expect(res.status).toBe(200)
    sessionCookie = cookieFrom(res)
    expect(sessionCookie).toContain('session_token=')
  })

  it('f. lets the session cookie into GET /api', async () => {
    const res = await getApi(sessionCookie)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello from hono' })
  })

  it('g. revokes the session on sign-out, so the same cookie gets 401', async () => {
    const out = await post('/api/auth/sign-out', {}, sessionCookie)
    expect(out.status).toBe(200)

    const res = await getApi(sessionCookie)
    expect(res.status).toBe(401)
  })

  it('logged USER_CREATED and USER_LOGGED_IN only for the successful steps', () => {
    // a (sign-up) and e (sign-in) succeeded; b, c, d failed and must not log.
    expect(loggedTypes()).toEqual([
      EventLogType.USER_CREATED,
      EventLogType.USER_LOGGED_IN
    ])
  })
})
