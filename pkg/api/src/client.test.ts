import { describe, expect, test } from 'bun:test'
import type { ClientResponse } from 'hono/client'

// client.ts reads import.meta.env.VITE_BACKEND_URL at module load.
process.env.VITE_BACKEND_URL = 'http://localhost:3000'

const { rpcFetcher } = await import('./client')

// Minimal stand-in for a Hono ClientResponse.
const fakeResponse = (ok: boolean, body: unknown) =>
  Promise.resolve({
    ok,
    json: async () => body
  }) as unknown as Promise<ClientResponse<unknown, number, 'json'>>

describe('rpcFetcher', () => {
  test('returns the parsed body when the response is ok', async () => {
    const body = { message: 'ok', value: 42 }

    const result = await rpcFetcher(fakeResponse(true, body))

    expect(result).toEqual(body)
  })

  test('throws with body.message when the response is not ok', async () => {
    expect(rpcFetcher(fakeResponse(false, { message: 'boom' }))).rejects.toThrow(
      'boom'
    )
  })
})
