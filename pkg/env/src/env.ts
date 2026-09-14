import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"], {
    error: "NODE_ENV should one of development | production.",
  }),
  DATABASE_URL: z
    .url({ error: "DATABASE_URL is required" })
    .startsWith("postgres://", {
      error: "DATABASE_URL should start with postgres://.",
    }),
  PORT: z.coerce.number({ error: "PORT is required." }),
  BETTER_AUTH_SECRET: z
    .string({ error: "BETTER_AUTH_SECRET is requred." })
    .min(32, { error: "BETTER_AUTH_SECRET min length 32." }),
  BETTER_AUTH_URL: z
    .url({ error: "BETTER_AUTH_URL is requred." })
    .startsWith("http", {
      error: "BETTER_AUTH_URL should start with http or https.",
    }),
  ENCRYPTION_KEY: z
    .string({ error: "ENCRYPTION_KEY is requred." })
    .min(32, { error: "ENCRYPTION_KEY min length 32." }),
});

type EnvSchema = z.infer<typeof envSchema>;

export const env = (() => {
  const parsed = envSchema.safeParse(Bun.env);

  if (!parsed.success) {
    console.log(`Invalid environtment variables: ${parsed.error.message}`);

    process.exit(1);
  }

  return Object.keys(envSchema.shape).reduce(
    (acc, curr) => ({ ...acc, [curr]: Bun.env[curr] }),
    {} as EnvSchema,
  );
})();
