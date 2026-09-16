# syntax=docker/dockerfile:1

# ---- Build stage ------------------------------------------------------------
FROM oven/bun:1.3.14 AS build
WORKDIR /app

# The frontend base URL is compiled into the bundle (Vite build-time env).
# Override for your domain:
#   docker build --build-arg VITE_BACKEND_URL=https://your.domain .
ARG VITE_BACKEND_URL=http://localhost:3000

COPY package.json bun.lock ./
COPY pkg ./pkg
COPY apps ./apps
RUN bun install --frozen-lockfile

# A non-secret backend env lets Prisma generate the client (no DB connection is
# made during generation). The frontend env only carries the public base URL.
RUN cp apps/backend/.env.example apps/backend/.env \
 && printf 'VITE_BACKEND_URL=%s\n' "$VITE_BACKEND_URL" > apps/frontend/.env

RUN bun run db:gen && bun run build

# ---- Runtime stage ----------------------------------------------------------
FROM oven/bun:1.3.14 AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Ship the installed workspace + generated Prisma client + built frontend.
COPY --from=build /app /app

# Never bake env into the image — real secrets are injected at run time
# (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ENCRYPTION_KEY, PORT).
RUN rm -f apps/backend/.env apps/frontend/.env

EXPOSE 3000
# app-prod.ts exports a Bun server (serves the API + static frontend on env.PORT).
CMD ["bun", "apps/backend/src/app-prod.ts"]
