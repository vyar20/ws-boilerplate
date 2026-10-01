import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production'], {
    error: 'NODE_ENV should be one of development | production.'
  }),
  DATABASE_URL: z
    .url({ error: 'DATABASE_URL is required' })
    .regex(/^postgres(ql)?:\/\//, {
      error: 'DATABASE_URL should start with postgres:// or postgresql://.'
    }),
  PORT: z.coerce.number({ error: 'PORT is required.' }),
  BETTER_AUTH_SECRET: z
    .string({ error: 'BETTER_AUTH_SECRET is required.' })
    .min(32, { error: 'BETTER_AUTH_SECRET min length 32.' }),
  BETTER_AUTH_URL: z
    .url({ error: 'BETTER_AUTH_URL is required.' })
    .startsWith('http', {
      error: 'BETTER_AUTH_URL should start with http or https.'
    }),
  // Not used yet; reserved for app-level encryption. Still validated if set.
  ENCRYPTION_KEY: z
    .string()
    .min(32, { error: 'ENCRYPTION_KEY min length 32.' })
    .optional()
})

export const env = (() => {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error(
      `Invalid environment variables: ${JSON.stringify(parsed.error.issues, null, 2)}`
    )

    process.exit(1)
  }

  // Return the parsed/coerced values (e.g. PORT as number), not the raw
  // process.env strings — otherwise the inferred types would lie at runtime.
  return parsed.data
})()
