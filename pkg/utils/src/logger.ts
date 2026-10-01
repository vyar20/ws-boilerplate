import path from 'node:path'
import pino from 'pino'

const logPath = path.resolve(import.meta.dirname, '../../../logs')

const fileTarget = (level: 'info' | 'error', file: string) => ({
  level,
  target: 'pino/file',
  options: { destination: path.join(logPath, file), mkdir: true }
})

// Production logs go to stdout so the platform (Docker, systemd, a PaaS) can
// collect them; local files under logs/ are a development convenience only.
export const createLogger = (nodeEnv = process.env.NODE_ENV) =>
  nodeEnv === 'production'
    ? pino()
    : pino(
        pino.transport({
          targets: [
            fileTarget('info', 'info.log'),
            fileTarget('error', 'error.log')
          ]
        })
      )

export const logger = createLogger()
