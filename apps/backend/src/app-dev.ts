import { getRequestListener } from '@hono/node-server'
import { env } from '@repo/env'
import { HTTPCode, HTTPText } from '@repo/utils/utils'
import { createServer } from 'node:http'
import { app, vite } from './app'

const honoHandler = getRequestListener(app.fetch)

const server = await createServer((req, res) => {
  const url = req.url

  if (url?.startsWith('/api')) return honoHandler(req, res)

  vite.middlewares(req, res, () => {
    res.statusCode = HTTPCode.NOT_FOUND
    res.end(HTTPText.NOT_FOUND)
  })
})

server.listen(env.PORT, () =>
  console.log('Server running on: http://localhost:3000')
)
