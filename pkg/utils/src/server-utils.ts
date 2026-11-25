import path from 'path'
import pino from 'pino'
export { type Logger } from 'pino'

const workDir = path.resolve(import.meta.dirname)
const pinoLogLevel = ['trace', 'debug', 'info', 'warn', 'error']

const prettyTransport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true
  }
})

const fileTransport = pino.transport({
  dedupe: true,
  targets: pinoLogLevel.map((level) => ({
    target: 'pino/file',
    level,
    options: {
      destination: path.join(workDir, `../../../logs/${level}.log`),
      mkdir: true
    }
  }))
})

export const logger = pino(
  {
    level: 'trace'
  },
  pino.multistream([
    {
      level: 'trace',
      stream: prettyTransport
    },
    {
      level: 'trace',
      stream: fileTransport
    }
  ])
)

const sensitiveKey = ['password', 'accessToken', 'authorization', 'cookie']

export const redactSensitiveData = (data: Record<string, string>) => {
  for (const key of Object.keys(data)) {
    if (sensitiveKey.includes(key)) data[key] = '***REDACTED***'
  }

  return data
}
