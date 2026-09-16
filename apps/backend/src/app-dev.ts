import { getRequestListener } from '@hono/node-server'
import { env } from '@repo/env'
import { HTTPCode, HTTPText } from '@repo/utils/utils'
import { createServer } from 'node:http'
import { createServer as createViteServer } from 'vite'
import { app, frontendPath } from './app'

const honoHandler = getRequestListener(app.fetch)

// Vite dev server lives in the dev entrypoint only, so production
// (app-prod.ts) never spins one up.
const vite = await createViteServer({
  server: { middlewareMode: true },
  root: frontendPath,
  mode: 'spa'
})

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
