import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { createElement, type ReactNode } from 'react'

type AuthResult = { data: unknown; error: { message: string } | null }

const ok = (data: unknown = {}): AuthResult => ({ data, error: null })
const fail = (message: string): AuthResult => ({ data: null, error: { message } })

// The Better Auth client and react-router are external; mocking them keeps the
// test on what the hooks own: error mapping, cache invalidation, navigation.
const authClient = {
  getSession: mock(async () => ok()),
  signIn: { email: mock(async (_input: unknown) => ok()) },
  signUp: { email: mock(async (_input: unknown) => ok()) },
  signOut: mock(async () => ok())
}
const navigate = mock((_to: string) => {})

mock.module('../lib/auth-client', () => ({ authClient }))
mock.module('react-router', () => ({ useNavigate: () => navigate }))

const { useSession } = await import('./use-session')
const { useSignIn } = await import('./use-sign-in')
const { useSignUp } = await import('./use-sign-up')
const { useSignOut } = await import('./use-sign-out')

let queryClient: QueryClient

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children)

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } }
  })
  navigate.mockClear()
  authClient.signIn.email.mockClear()
  authClient.signUp.email.mockClear()
})

describe('useSession', () => {
  it('returns the session data', async () => {
    const session = { user: { id: 'u1' } }
    authClient.getSession.mockResolvedValueOnce(ok(session))

    const { result } = renderHook(() => useSession(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data as unknown).toEqual(session)
  })

  it('surfaces the auth error message without retrying', async () => {
    authClient.getSession.mockClear()
    authClient.getSession.mockResolvedValueOnce(fail('expired'))

    const { result } = renderHook(() => useSession(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('expired')
    expect(authClient.getSession).toHaveBeenCalledTimes(1)
  })
})

const signInInput = { email: 'a@b.com', password: 'Str0ng!Passw0rd' }
const signUpInput = {
  ...signInInput,
  name: 'A',
  confirmPassword: signInInput.password
}

describe('useSignIn', () => {
  it('calls the auth client, refreshes the session and navigates', async () => {
    const invalidate = spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSignIn(), { wrapper })

    await result.current.mutateAsync(signInInput)

    expect(authClient.signIn.email).toHaveBeenCalledWith(signInInput)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['auth', 'session'] })
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('rejects with the auth error and does not navigate', async () => {
    authClient.signIn.email.mockResolvedValueOnce(fail('Invalid credentials'))
    const { result } = renderHook(() => useSignIn(), { wrapper })

    await expect(result.current.mutateAsync(signInInput)).rejects.toThrow(
      'Invalid credentials'
    )
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe('useSignUp', () => {
  it('calls the auth client, refreshes the session and navigates', async () => {
    const invalidate = spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSignUp(), { wrapper })

    await result.current.mutateAsync(signUpInput)

    expect(authClient.signUp.email).toHaveBeenCalledWith(signUpInput)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['auth', 'session'] })
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('rejects with the auth error and does not navigate', async () => {
    authClient.signUp.email.mockResolvedValueOnce(fail('Email taken'))
    const { result } = renderHook(() => useSignUp(), { wrapper })

    await expect(result.current.mutateAsync(signUpInput)).rejects.toThrow(
      'Email taken'
    )
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe('useSignOut', () => {
  it('signs out, refreshes the session and navigates home', async () => {
    const invalidate = spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSignOut(), { wrapper })

    await result.current.mutateAsync()

    expect(authClient.signOut).toHaveBeenCalled()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['auth', 'session'] })
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('rejects with the auth error and does not navigate', async () => {
    authClient.signOut.mockResolvedValueOnce(fail('network down'))
    const { result } = renderHook(() => useSignOut(), { wrapper })

    await expect(result.current.mutateAsync()).rejects.toThrow('network down')
    expect(navigate).not.toHaveBeenCalled()
  })
})
