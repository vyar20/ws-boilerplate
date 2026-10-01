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

// Registered outside /api: the API router's catch-all would shadow anything
// added under /api after it. onError is app-wide, so coverage is unchanged.
app.get('/test/boom', () => {
  throw new Error('db password=hunter2 leaked in stack')
})
app.get('/test/bad', () => {
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
    // JSON, like the Better Auth client sends; a bare POST would hit csrf().
    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}'
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('auth-handled')
    expect(authHandler).toHaveBeenCalledTimes(1)
  })

  it('returns a JSON 404 for an unknown /api path when signed in', async () => {
    currentSession = signedIn

    const res = await app.request('/api/does-not-exist')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ message: 'NOT_FOUND' })
  })

  it('returns 401, not 404, for an unknown /api path when signed out', async () => {
    const res = await app.request('/api/does-not-exist')

    expect(res.status).toBe(401)
  })

  it('maps an ErrorHandler to its status code and message', async () => {
    const res = await app.request('/test/bad')

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ message: 'Invalid input' })
    expect(logError).toHaveBeenCalledWith({
      message: 'Invalid input',
      reason: 'field x missing'
    })
  })

  it('hides unexpected error details from the client', async () => {
    const res = await app.request('/test/boom')
    const body = await res.text()

    expect(res.status).toBe(500)
    expect(JSON.parse(body)).toEqual({ message: 'INTERNAL_SERVER_ERROR' })
    expect(body).not.toContain('hunter2')
    expect(logError).toHaveBeenCalledTimes(1)
  })
})

describe('security headers', () => {
  it.each(['/api', '/api/auth/get-session', '/test/bad'])(
    'are set on %s',
    async (path) => {
      const res = await app.request(path)

      expect(res.headers.get('x-content-type-options')).toBe('nosniff')
      expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN')
      expect(res.headers.get('referrer-policy')).toBe('no-referrer')
    }
  )
})

describe('csrf', () => {
  // app.request() resolves against http://localhost, so that is "same origin".
  const formPost = (path: string, origin: string) =>
    app.request(path, {
      method: 'POST',
      headers: {
        origin,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: 'email=a%40b.com'
    })

  it('rejects a cross-origin form POST to /api with 403', async () => {
    currentSession = signedIn

    const res = await formPost('/api', 'https://evil.example')

    expect(res.status).toBe(403)
  })

  it('rejects a cross-origin form POST before it reaches Better Auth', async () => {
    const res = await formPost('/api/auth/sign-in/email', 'https://evil.example')

    expect(res.status).toBe(403)
    expect(authHandler).not.toHaveBeenCalled()
  })

  it('lets a same-origin form POST through', async () => {
    const res = await formPost('/api/auth/sign-in/email', 'http://localhost')

    expect(res.status).toBe(200)
    expect(authHandler).toHaveBeenCalledTimes(1)
  })

  it('lets a same-origin browser request through via Sec-Fetch-Site', async () => {
    const res = await app.request('/api/auth/sign-out', {
      method: 'POST',
      headers: { 'sec-fetch-site': 'same-origin' }
    })

    expect(res.status).toBe(200)
  })

  it('leaves JSON requests to the CORS preflight', async () => {
    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        origin: 'https://evil.example',
        'content-type': 'application/json'
      },
      body: '{}'
    })

    expect(res.status).toBe(200)
  })
})
