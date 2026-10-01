import { beforeEach, describe, expect, it, mock } from 'bun:test'

// Better Auth, env and the Pino logger are external to the unit under test —
// the middleware order and error handling in `app.ts` — so they are mocked.
let currentSession: unknown = null

const getSession = mock(async (_opts: { headers: Headers }) => currentSession)
const authHandler = mock(async (_req: Request) => new Response('auth-handled'))
const logError = mock((_obj: unknown) => {})

mock.module('@repo/env', () => ({
  env: { NODE_ENV: 'development', PORT: 3000 }
}))
mock.module('@repo/utils/logger', () => ({
  logger: { error: logError, info: mock() }
}))
mock.module('@repo/api/auth', () => ({
  auth: { api: { getSession }, handler: authHandler }
}))

const { ErrorHandler } = await import('@repo/utils')
const { app } = await import('./app')

app.get('/api/boom', () => {
  throw new Error('db password=hunter2 leaked in stack')
})
app.get('/api/bad', () => {
  throw new ErrorHandler('Invalid input', 'BAD_REQUEST', 'field x missing')
})

const signedIn = { user: { id: 'u1' }, session: { id: 's1' } }

beforeEach(() => {
  currentSession = null
  getSession.mockClear()
  authHandler.mockClear()
  logError.mockClear()
})

describe('app', () => {
  it('rejects /api without a session with 401', async () => {
    const res = await app.request('/api')

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ message: 'UNAUTHORIZED' })
  })

  it('serves /api when a session exists', async () => {
    currentSession = signedIn

    const res = await app.request('/api')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello from hono' })
  })

  it('resolves the session from the request headers', async () => {
    await app.request('/api', { headers: { cookie: 'session=abc' } })

    expect(getSession).toHaveBeenCalledTimes(1)
    expect(getSession.mock.calls[0]![0].headers.get('cookie')).toBe(
      'session=abc'
    )
  })

  it('lets /api/auth/* through to Better Auth without a session', async () => {
    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST'
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('auth-handled')
    expect(authHandler).toHaveBeenCalledTimes(1)
  })

  it('maps an ErrorHandler to its status code and message', async () => {
    currentSession = signedIn

    const res = await app.request('/api/bad')

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ message: 'Invalid input' })
    expect(logError).toHaveBeenCalledWith({
      message: 'Invalid input',
      reason: 'field x missing'
    })
  })

  it('hides unexpected error details from the client', async () => {
    currentSession = signedIn

    const res = await app.request('/api/boom')
    const body = await res.text()

    expect(res.status).toBe(500)
    expect(JSON.parse(body)).toEqual({ message: 'INTERNAL_SERVER_ERROR' })
    expect(body).not.toContain('hunter2')
    expect(logError).toHaveBeenCalledTimes(1)
  })
})
