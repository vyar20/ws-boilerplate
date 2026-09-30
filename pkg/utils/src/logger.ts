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
    }
  ]
})

export const logger = pino(transport)
