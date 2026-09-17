import { createAuthClient } from 'better-auth/react'
import { type ClientResponse, hc } from 'hono/client'
import { type AppType } from './client-route'

// Same-origin (single-port) serving: the frontend and the API share one origin,
// so relative paths resolve correctly in the browser without a build-time base URL.
export const api = hc<AppType>('/api', {
  init: {
    credentials: 'include'
  }
})

// baseURL omitted on purpose: Better Auth falls back to window.location.origin,
// which is correct under single-port serving.
export const authClient = createAuthClient()

type RpcBody<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ClientResponse<any, infer TOutput, any> ? TOutput : never

export const rpcFetcher = async <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Promise<ClientResponse<any, any, any>>
>(
  req: T
): Promise<RpcBody<Awaited<T>>> => {
  const res = await req
  const body = await res.json()

  if (!res.ok) {
    throw new Error((body as { message: string }).message)
  }

  return body as RpcBody<Awaited<T>>
}
