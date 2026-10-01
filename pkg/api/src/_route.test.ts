import { describe, expect, it } from 'bun:test'
import { _route } from './_route'

// `_route` imports `./lib/auth` as a *type only*, so the server auth/db stack is
// erased at runtime and the route tree can be exercised in isolation.
describe('_route', () => {
  it('GET / returns the greeting payload', async () => {
    const res = await _route.request('/')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello from hono' })
  })

  it.each(['GET', 'POST', 'DELETE'])(
    'returns a JSON 404 for an unknown path (%s)',
    async (method) => {
      const res = await _route.request('/does-not-exist', { method })

      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ message: 'NOT_FOUND' })
    }
  )
})
