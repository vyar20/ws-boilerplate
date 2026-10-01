import { afterEach, describe, expect, it, mock } from 'bun:test'
import { api } from './rpc'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('rpc client', () => {
  it('calls the same-origin /api base and sends cookies', async () => {
    const fetchMock = mock(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        Response.json({ message: 'Hello from hono' })
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const res = await api.index.$get()

    expect(await res.json()).toEqual({ message: 'Hello from hono' })
    const [input, init] = fetchMock.mock.calls[0]!
    expect(String(input)).toMatch(/\/api\/?$/)
    expect(init?.credentials).toBe('include')
  })
})
