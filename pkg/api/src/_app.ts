import { type serverAuth } from "@repo/auth/server-auth";
import { db } from "@repo/db";
import { env } from "@repo/env";
import { HTTPCode, p } from "@repo/utils/client-utils";
import { type Logger } from "@repo/utils/server-utils";
import { formatDistanceToNow } from "date-fns";
import { Hono } from "hono";

export type HonoEnv = {
  Variables: {
    session: typeof serverAuth.$Infer.Session | null
    logger: Logger
  }
}

const globalAppStart = globalThis as unknown as {
  appStartAt: number
}
const appStartAt = globalAppStart.appStartAt ?? Date.now()

if (env.NODE_ENV !== 'production') globalAppStart.appStartAt = appStartAt

export const _app = new Hono<HonoEnv>().get('/health', async c => {
    const [err] = await p(db.$queryRaw`SELECT 1`)

  return c.json(
    {
      status: 'OK',
      database: {
        status: err ? 'Not Connected' : 'Connected'
      },
      timestamp: Date.now(),
      upTime: formatDistanceToNow(appStartAt, {
        addSuffix: true,
        includeSeconds: true
      })
    },
    err ? HTTPCode.SERVICE_UNAVAILABLE : HTTPCode.OK
  )
})


export type AppRoute = typeof _app