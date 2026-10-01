import path from 'node:path'
import pino from 'pino'

const logPath = path.resolve(import.meta.dirname, '../../../logs')

const fileTarget = (
  level: 'info' | 'error',
  file: string
): pino.TransportTargetOptions => ({
  level,
  target: 'pino/file',
  options: { destination: path.join(logPath, file), mkdir: true }
})

// Production logs go to stdout as plain JSON so the platform (Docker, systemd,
// a PaaS) can collect them. Development adds a readable terminal stream
// (pino-pretty, a devDependency) next to the files under logs/.
export const createLogger = (nodeEnv = process.env.NODE_ENV) =>
  nodeEnv === 'production'
    ? pino()
    : pino(
        pino.transport({
          targets: [
            {
              level: 'info',
              target: 'pino-pretty',
              options: { colorize: true }
            },
            fileTarget('info', 'info.log'),
            fileTarget('error', 'error.log')
          ]
        })
      )

export const logger = createLogger()
