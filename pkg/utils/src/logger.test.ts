import { beforeEach, describe, expect, it, mock } from 'bun:test'

type Target = {
  level: string
  target: string
  options: { destination?: string; mkdir?: boolean; colorize?: boolean }
}

// pino is mocked so the test checks the configuration chosen per environment
// without spawning transport worker threads or touching the filesystem.
const transport = mock((opts: { targets: Target[] }) => ({ opts }))
const pinoMock = Object.assign(
  mock((dest?: unknown) => ({ dest })),
  { transport }
)

mock.module('pino', () => ({ default: pinoMock }))

const { createLogger } = await import('./logger')

beforeEach(() => {
  pinoMock.mockClear()
  transport.mockClear()
})

describe('createLogger', () => {
  it('writes to stdout in production', () => {
    createLogger('production')

    expect(pinoMock).toHaveBeenCalledTimes(1)
    expect(pinoMock.mock.calls[0]).toEqual([])
    expect(transport).not.toHaveBeenCalled()
  })

  it('pretty-prints to the terminal and writes files under logs/ in development', () => {
    createLogger('development')

    const { targets } = transport.mock.calls[0]![0]
    expect(targets.map((t) => [t.level, t.target])).toEqual([
      ['info', 'pino-pretty'],
      ['info', 'pino/file'],
      ['error', 'pino/file']
    ])
    expect(targets[1]!.options.destination).toMatch(/logs\/info\.log$/)
    expect(targets[2]!.options.destination).toMatch(/logs\/error\.log$/)
  })

  it('creates the logs/ folder automatically', () => {
    createLogger('development')

    const { targets } = transport.mock.calls[0]![0]
    const files = targets.filter((t) => t.target === 'pino/file')
    expect(files.every((t) => t.options.mkdir)).toBe(true)
  })

  it('never uses pino-pretty in production', () => {
    createLogger('production')

    expect(transport).not.toHaveBeenCalled()
  })

  it('defaults to file logging when NODE_ENV is not production', () => {
    createLogger(undefined)

    expect(transport).toHaveBeenCalledTimes(1)
  })
})
