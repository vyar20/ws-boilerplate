import { beforeEach, describe, expect, it, mock } from 'bun:test'

// Better Auth, env and the Pino logger are external to the unit under test —
// the middleware order and error handling in `app.ts` — so they are mocked.
let currentSession: unknown = null

const getSession = mock(async (_opts: { headers: Headers }) => currentSession)
const authHandler = mock(async (_req: Request) => new Response('auth-handled'))
const logError = mock((_obj: unknown) => {})
const logWarn = mock((_obj: unknown) => {})

mock.module('@repo/env', () => ({
  // Public https URL while app.request() uses http://localhost, like a
  // TLS-terminating reverse proxy in front of the app.
  env: {
    NODE_ENV: 'development',
    PORT: 3000,
    BETTER_AUTH_URL: 'https://app.example.com/some/path'
  }
}))
mock.module('@repo/utils/logger', () => ({
  logger: { error: logError, warn: logWarn, info: mock() }
}))
mock.module('@repo/api/auth', () => ({
  auth: { api: { getSession }, handler: authHandler }
}))

const { ErrorHandler } = await import('@repo/utils')
const { app } = await import('./app')

// Registered outside /api: app.ts's /api/* 404 fallback would shadow anything
// added under /api after import. onError is app-wide, so coverage is unchanged.
app.get('/test/boom', () => {
  throw new Error('db password=hunter2 leaked in stack')
})
app.get('/test/bad', () => {
  throw new ErrorHandler('Invalid input', 'BAD_REQUEST', 'field x missing')
})
app.get('/test/server-error', () => {
  throw new ErrorHandler('Upstream down', 'INTERNAL_SERVER_ERROR', 'timeout')
})

const signedIn = { user: { id: 'u1' }, session: { id: 's1' } }

beforeEach(() => {
  currentSession = null
  getSession.mockClear()
  authHandler.mockClear()
  logError.mockClear()
  logWarn.mockClear()
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

  it.each([
    ['GET', '/api/does-not-exist'],
    ['POST', '/api/does-not-exist'],
    ['DELETE', '/api/does-not-exist'],
    ['GET', '/api/nested/does-not-exist']
  ])('returns a JSON 404 for %s %s when signed in', async (method, path) => {
    currentSession = signedIn

    const res = await app.request(path, {
      method,
      headers: { 'content-type': 'application/json' }
    })

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
  })

  it('logs a 4xx ErrorHandler as a warning, not an error', async () => {
    await app.request('/test/bad')

    expect(logWarn).toHaveBeenCalledWith({
      message: 'Invalid input',
      reason: 'field x missing'
    })
    expect(logError).not.toHaveBeenCalled()
  })

  it('logs a missing session (401) as a warning', async () => {
    await app.request('/api')

    expect(logWarn).toHaveBeenCalledTimes(1)
    expect(logError).not.toHaveBeenCalled()
  })

  it('logs a 5xx ErrorHandler as an error', async () => {
    const res = await app.request('/test/server-error')

    expect(res.status).toBe(500)
    expect(logError).toHaveBeenCalledWith({
      message: 'Upstream down',
      reason: 'timeout'
    })
    expect(logWarn).not.toHaveBeenCalled()
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

  it('sends a Content-Security-Policy with the expected directives', async () => {
    const res = await app.request('/api/auth/get-session')
    const csp = res.headers.get('content-security-policy') ?? ''
    const directives = Object.fromEntries(
      csp.split(';').map((d) => {
        const [name, ...values] = d.trim().split(/\s+/)
        return [name, values.join(' ')]
      })
    )

    expect(directives).toEqual({
      'default-src': "'self'",
      'script-src': "'self'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data:",
      'font-src': "'self' data:",
      'connect-src': "'self'",
      'frame-ancestors': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'"
    })
  })
})

describe('csrf', () => {
  const PUBLIC_ORIGIN = 'https://app.example.com'

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
    expect(logWarn).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, path: '/api' })
    )
    expect(logError).not.toHaveBeenCalled()
  })

  it('rejects a cross-origin form POST before it reaches Better Auth', async () => {
    const res = await formPost(
      '/api/auth/sign-in/email',
      'https://evil.example'
    )

    expect(res.status).toBe(403)
    expect(authHandler).not.toHaveBeenCalled()
  })

  it('accepts the BETTER_AUTH_URL origin although the request URL is http', async () => {
    const res = await formPost('/api/auth/sign-in/email', PUBLIC_ORIGIN)

    expect(res.status).toBe(200)
    expect(authHandler).toHaveBeenCalledTimes(1)
  })

  it.each([
    'http://localhost',
    'http://app.example.com',
    'https://app.example.com:8443',
    'https://evil.app.example.com'
  ])('rejects any other origin (%s) with 403', async (origin) => {
    const res = await formPost('/api/auth/sign-in/email', origin)

    expect(res.status).toBe(403)
    expect(authHandler).not.toHaveBeenCalled()
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
