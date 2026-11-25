/// <reference types="bun"/>

import z from 'zod'

declare module 'bun' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Env extends EnvSchema {}
}

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development'], {
    error: 'NODE_ENV should be one of production|development.'
  }),
  PORT: z.coerce.number({ error: 'PORT is required.' }),
  DATABASE_URL: z
    .url('DATABASE_URL is required')
    .regex(/^(postgres|postgresql):\/\//, {
      error: 'DATABASE_URL should start with (postgres|postgresql)://'
    }),
  BETTER_AUTH_BASE_URL: z
    .url({
      error: 'BETTER_AUTH_BASE_URL is required'
    })
    .regex(/^https?:\/\//, {
      error: 'BETTER_AUTH_BASE_URL should start with (http|https)://'
    }),
  BETTER_AUTH_SECRET: z
    .string({ error: 'BETTER_AUTH_BASE_URL is required' })
    .min(32, {
      error: 'BETTER_AUTH_BASE_URL min 32 chars'
    })
})

type EnvSchema = z.infer<typeof envSchema>

export const env = (() => {
  const parsed = envSchema.safeParse(Bun.env)

  if (!parsed.success) {
    console.log('Invalid environtment variables')
    console.log(parsed.error.issues)
    process.exit(1)
  }

  return parsed.data
})()
