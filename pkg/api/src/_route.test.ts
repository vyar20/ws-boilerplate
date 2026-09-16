import { describe, expect, test } from 'bun:test'
import { _route } from './_route'

// _route only depends on `hono` (the auth import is type-only), so it can be
// exercised in isolation via Hono's built-in request helper.
describe('_route', () => {
  test('GET / returns the hello message', async () => {
    const res = await _route.request('/')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello from hono' })
  })

  test('unknown path returns 404', async () => {
    const res = await _route.request('/does-not-exist')

    expect(res.status).toBe(404)
  })
})
