import { env } from '@repo/env'
import app from './app'

export default {
  port: env.PORT,
  fetch: app.fetch
}
