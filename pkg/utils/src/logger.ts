import path from 'node:path'
import pino from 'pino'

const logPath = path.resolve(import.meta.dirname, '../../../logs')
const transport = pino.transport({
  targets: [
    {
      level: 'info',
      target: 'pino/file',
      options: { destination: path.join(logPath, 'info.log') }
    },
    {
      level: 'error',
      target: 'pino/file',
      options: { destination: path.join(logPath, 'error.log') }
    },
    {
      level: 'debug',
      target: 'pino/file',
      options: { destination: path.join(logPath, 'debug.log') }
    },
    {
      level: 'fatal',
      target: 'pino/file',
      options: { destination: path.join(logPath, 'fatal.log') }
    },
    {
      level: 'silent',
      target: 'pino/file',
      options: { destination: path.join(logPath, 'silent.log') }
    },
    {
      level: 'trace',
      target: 'pino/file',
      options: { destination: path.join(logPath, 'trace.log') }
    },
    {
      level: 'warn',
      target: 'pino/file',
      options: { destination: path.join(logPath, 'warn.log') }
    }
  ]
})

export const logger = pino(transport)
