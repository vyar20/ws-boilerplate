import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production'], {
    error: 'NODE_ENV should one of development | production.'
  }),
  DATABASE_URL: z
    .url({ error: 'DATABASE_URL is required' })
    .regex(/^postgres(ql)?:\/\//, {
      error: 'DATABASE_URL should start with postgres:// or postgresql://.'
    }),
  PORT: z.coerce.number({ error: 'PORT is required.' }),
  BETTER_AUTH_SECRET: z
    .string({ error: 'BETTER_AUTH_SECRET is requred.' })
    .min(32, { error: 'BETTER_AUTH_SECRET min length 32.' }),
  BETTER_AUTH_URL: z
    .url({ error: 'BETTER_AUTH_URL is requred.' })
    .startsWith('http', {
      error: 'BETTER_AUTH_URL should start with http or https.'
    }),
  ENCRYPTION_KEY: z
    .string({ error: 'ENCRYPTION_KEY is requred.' })
    .min(32, { error: 'ENCRYPTION_KEY min length 32.' })
})

export const env = (() => {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.log(
      `Invalid environtment variables: ${JSON.stringify(parsed.error.issues, null, 2)}`
    )

    process.exit(1)
  }

  // Return the parsed/coerced values (e.g. PORT as number), not the raw
  // process.env strings — otherwise the inferred types would lie at runtime.
  return parsed.data
})()
