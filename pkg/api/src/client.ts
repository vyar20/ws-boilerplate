import { createAuthClient } from 'better-auth/react'
import { type ClientResponse, hc } from 'hono/client'
import { type AppType } from './client-route'

export const api = hc<AppType>(`${import.meta.env.VITE_BACKEND_URL}/api`, {
  init: {
    credentials: 'include'
  }
})

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL
})

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
