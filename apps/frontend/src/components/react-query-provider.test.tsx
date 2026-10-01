import { useMutation } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

const add = mock((_toast: unknown) => {})

mock.module('@/components/ui/toast', () => ({ toast: { add } }))

const { ReactQueryProvider } = await import('./react-query-provider')

afterEach(cleanup)
beforeEach(() => add.mockClear())

const Trigger = ({ fn }: { fn: () => Promise<unknown> }) => {
  const { mutate } = useMutation({ mutationFn: fn })
  return <button onClick={() => mutate()}>go</button>
}

const run = async (fn: () => Promise<unknown>) => {
  render(
    <ReactQueryProvider>
      <Trigger fn={fn} />
    </ReactQueryProvider>
  )
  await act(async () => screen.getByText('go').click())
}

describe('ReactQueryProvider', () => {
  it('shows an error toast when any mutation fails', async () => {
    await run(async () => {
      throw new Error('Invalid credentials')
    })

    expect(add).toHaveBeenCalledWith({
      type: 'error',
      description: 'Invalid credentials',
      priority: 'high'
    })
  })

  it('shows an info toast when a mutation returns a message', async () => {
    await run(async () => ({ message: 'Saved' }))

    expect(add).toHaveBeenCalledWith({ type: 'info', description: 'Saved' })
  })

  it('stays quiet when a mutation returns no message', async () => {
    await run(async () => ({ ok: true }))

    expect(add).not.toHaveBeenCalled()
  })
})
