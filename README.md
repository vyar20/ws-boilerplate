# Bun + Workspace + Hono + Better Auth Boilerplate

A full‑stack, type‑safe monorepo boilerplate. A single [Hono](https://hono.dev) server hosts a fully‑typed API **and** serves the [React](https://react.dev) frontend on **one port** — with [Better Auth](https://better-auth.com) email/password authentication wired end‑to‑end, [Prisma](https://prisma.io) + PostgreSQL for persistence, and end‑to‑end type safety from the database to the browser via Hono RPC.

Fork it, set a few environment variables, and start building.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Project structure](#project-structure)
- [Packages & apps](#packages--apps)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Routes](#routes)
- [How it works](#how-it-works)
- [Recipes](#recipes)
- [Production build](#production-build)
- [Security notes](#security-notes)

---

## Tech stack

| Area | Technology |
| --- | --- |
| Runtime / package manager | **Bun** (workspaces, `--hot`, bundler for the backend) |
| Language | **TypeScript** |
| HTTP server | **Hono** + Hono RPC (`hc`) client |
| Authentication | **Better Auth** (email & password) |
| Database | **Prisma** ORM + `@prisma/adapter-pg` (**PostgreSQL**) |
| Frontend | **React 19**, **React Router**, **Vite** |
| Data fetching | **TanStack Query** (React Query) |
| Forms & validation | **react-hook-form** + **Zod** (shared schemas) |
| UI | **Tailwind CSS v4**, **shadcn / base-ui**, **lucide-react**, **sonner**, **next-themes** |
| Logging | **Pino** (file transport) |
| Tooling | **ESLint**, **Prettier**, **React Compiler** |

---

## Features

- 🔒 **Auth out of the box** — sign up / sign in / sign out / session, with password‑strength enforcement.
- 🧩 **End‑to‑end type safety** — the API route type flows to the client as a *type only*; no server code ships to the browser.
- 🚀 **Single port** — API under `/api`, SPA everywhere else, served by one process.
- 🗂️ **Clean monorepo** — small, focused workspace packages with explicit boundaries.
- 🛡️ **Enforced client/server boundary** — ESLint blocks server‑only packages from being imported into the frontend bundle.
- ♻️ **Shared config** — one place for `tsconfig`, ESLint, and Prettier.

---

## Project structure

```
.
├── apps/
│   ├── backend/        # Hono server: API + serves the frontend (dev & prod)
│   └── frontend/       # React + Vite SPA
├── pkg/
│   ├── api/            # Hono routes, Better Auth setup, typed RPC client
│   ├── config/         # Shared tsconfig / eslint / prettier
│   ├── db/             # Prisma schema, models, generated client
│   ├── env/            # Zod-validated environment variables
│   ├── react-query/    # TanStack Query hooks (auth)
│   ├── utils/          # HTTP helpers, error handler, logger
│   └── validations/    # Shared Zod schemas
├── logs/               # Pino log output (gitignored)
├── package.json        # Root workspace + scripts
└── README.md
```

---

## Packages & apps

Every workspace package is published internally as `@repo/<name>` and consumed via `workspace:*`.

### Apps

| App | Description |
| --- | --- |
| **`apps/backend`** | The Hono server. [`app.ts`](apps/backend/src/app.ts) builds the app (session middleware → Better Auth handler → auth guard → API routes → error handler). [`app-dev.ts`](apps/backend/src/app-dev.ts) runs it with Vite middleware for HMR; [`app-prod.ts`](apps/backend/src/app-prod.ts) serves the static build. Both API and frontend run on **one port**. |
| **`apps/frontend`** | React 19 SPA (Vite + Tailwind v4). Providers for React Query, session, and theme; auth forms built with react-hook-form + shared Zod schemas; toasts via sonner. |

### Packages

| Package | Purpose | Key exports |
| --- | --- | --- |
| **`@repo/api`** | API layer. Hono route definitions, Better Auth configuration, and the browser RPC client. | `.` → `client.ts` (`api`, `authClient`, `rpcFetcher`), `./_route` (route + `AppType`), `./auth` (server-only auth) |
| **`@repo/db`** | Prisma client (singleton) + `pg` adapter and the schema/models (`User`, `Session`, `Account`, `Verification`). | `.` → `db` |
| **`@repo/env`** | Loads and **validates** `process.env` with Zod. Exits the process on invalid/missing vars, and returns *coerced* values (e.g. `PORT` as a number). | `.` → `env` |
| **`@repo/validations`** | Shared Zod schemas used on both client and server (sign-in, sign-up, password policy). | `./sign-in-validation`, `./sign-up-validation` |
| **`@repo/react-query`** | TanStack Query hooks that wrap the auth client. | `./auth/use-session`, `./auth/use-sign-in`, `./auth/use-sign-up`, `./auth/use-sign-out` |
| **`@repo/utils`** | Cross-cutting helpers: `HTTPCode`/`HTTPText`, `ErrorHandler`, `EventLogType`, `maskEmail`, a promise-tuple helper `p`, and the Pino `logger`. | `.` → `utils.ts`, `./logger` |
| **`@repo/config`** | Shared `tsconfig` base, ESLint config, and Prettier config. | `./tsconfig`, `./eslint`, `./prettier` |

---

## Prerequisites

- **[Bun](https://bun.sh)** ≥ the version pinned in `package.json` (`packageManager` field).
- A **PostgreSQL** database (local or hosted).

---

## Getting started

### 1. Fork & clone

```bash
git clone <your-fork-url>
cd <your-fork>
```

### 2. Install dependencies

From the repo root — this installs every workspace at once:

```bash
bun install
```

### 3. Configure environment variables

Create the two env files (see [Environment variables](#environment-variables) for details):

**`apps/backend/.env`**

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
BETTER_AUTH_SECRET=replace-with-a-random-string-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=replace-with-a-random-string-at-least-32-chars
```

**`apps/frontend/.env`**

```dotenv
VITE_BACKEND_URL=http://localhost:3000
```

> Generate strong secrets with: `openssl rand -base64 48`

### 4. Set up the database

```bash
bun run db:gen     # generate the Prisma client
bun run db:push    # push the schema to your database
```

### 5. Run the dev server

```bash
bun run dev
```

Open **http://localhost:3000**. The frontend and the API are both served from this single port.

---

## Environment variables

Validated in [`pkg/env/src/env.ts`](pkg/env/src/env.ts). The app **won't start** if any are missing or invalid.

### Backend — `apps/backend/.env`

| Variable | Type / rule | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` \| `production` | Runtime mode. |
| `PORT` | number | Port the server listens on. |
| `DATABASE_URL` | starts with `postgres://` or `postgresql://` | PostgreSQL connection string. |
| `BETTER_AUTH_SECRET` | string, min 32 chars | Secret used by Better Auth to sign sessions. |
| `BETTER_AUTH_URL` | URL starting with `http` | Public base URL of the auth server. |
| `ENCRYPTION_KEY` | string, min 32 chars | Reserved for app-level encrypt/decrypt. |

### Frontend — `apps/frontend/.env`

| Variable | Description |
| --- | --- |
| `VITE_BACKEND_URL` | Base URL the browser calls (API + auth). Must be `VITE_`-prefixed to be exposed to the client. |

> ⚠️ Only `VITE_`-prefixed variables are exposed to the browser. Server secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, …) are **never** shipped to the client.

---

## Scripts

Run from the repo root; each fans out across workspaces via `bun --filter '*'`.

| Script | What it does |
| --- | --- |
| `bun run dev` | Start the backend in dev mode (Hono + Vite HMR) on one port. |
| `bun run build` | Build the frontend for production. |
| `bun run start` | Start the backend in production mode (serves the static build). |
| `bun run db:gen` | Generate the Prisma client. |
| `bun run db:push` | Push the Prisma schema to the database. |
| `bun run db:std` | Open Prisma Studio. |
| `bun run auth:gen` | Regenerate Better Auth Prisma models. |
| `bun run del` | Remove all `node_modules`/build output. |

---

## Routes

### Backend (Hono)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `ALL` | `/api/auth/*` | Public | Better Auth handler (sign-up, sign-in, sign-out, get-session, …). |
| `GET` | `/api` | 🔒 Required | Example route → `{ "message": "Hello from hono" }`. |
| `*` | everything else | Public | Served by the SPA (Vite in dev, static `index.html` in prod). |

Everything under `/api/*` (except `/api/auth/*`) is protected by the [`isAuthenticated`](apps/backend/src/middleware/is-authenticated-middleware.ts) middleware.

### Auth endpoints (Better Auth)

| Method | Path | Body |
| --- | --- | --- |
| `POST` | `/api/auth/sign-up/email` | `{ name, email, password }` |
| `POST` | `/api/auth/sign-in/email` | `{ email, password }` |
| `POST` | `/api/auth/sign-out` | — |
| `GET` | `/api/auth/get-session` | — |

**Password policy** (enforced in [`pkg/validations`](pkg/validations/src/sign-in-validation.ts)): at least **12 characters**, with an uppercase letter, a lowercase letter, a number, and a symbol.

### Frontend (React Router)

| Path | Page | Notes |
| --- | --- | --- |
| `/` | Sign in / Sign up | Redirects to `/dashboard` when authenticated. |
| `/dashboard` | Dashboard | Shows the session; redirects to `/` when signed out. |

Redirects are handled centrally by [`SessionProvider`](apps/frontend/src/components/session-provider.tsx).

---

## How it works

### Single-port serving

In development, [`app-dev.ts`](apps/backend/src/app-dev.ts) routes `/api*` requests to Hono and everything else to Vite's middleware (HMR). In production, [`app-prod.ts`](apps/backend/src/app-prod.ts) serves the built assets and falls back to `index.html` for client-side routing. One process, one port.

### End-to-end type safety (Hono RPC)

The client is typed with `hc<AppType>()`, where `AppType` is the *type* of the Hono route tree. This type is imported **type-only** through a `.d.ts` bridge, so the actual server code is erased at build time — the browser bundle never contains route handlers, Prisma, or secrets.

### Auth flow

`authClient` (better-auth/react) talks to `/api/auth/*`. The [React Query hooks](pkg/react-query/src/auth) wrap it and invalidate the cached `['auth', 'session']` query after sign-in/up/out so route guards react to the fresh state. `sessionMiddleware` attaches the session to every request's context.

### Error handling & logging

Throw an `ErrorHandler(message, code, reason)` from [`@repo/utils`](pkg/utils/src/utils.ts) anywhere in the API; the global `onError` serializes it to a clean JSON response and logs it via Pino (to `logs/`). Unexpected errors return a generic `INTERNAL_SERVER_ERROR` — internal details are logged, never sent to the client.

---

## Recipes

### Add a new (protected) API route

1. Chain the route onto the app in [`pkg/api/src/_route.ts`](pkg/api/src/_route.ts):

   ```ts
   export const _route = new Hono<Env>()
     .get('/', (c) => c.json({ message: 'Hello from hono' }))
     .get('/me', (c) => {
       const session = c.get('session') // typed, provided by middleware
       return c.json({ user: session?.user ?? null })
     })
   ```

2. `AppType` updates automatically — the frontend RPC client is instantly typed for `/api/me`. Because the route lives under `/api`, it's protected by the auth guard by default.

3. Call it from the frontend with the typed client + `rpcFetcher`:

   ```ts
   import { api, rpcFetcher } from '@repo/api'
   const data = await rpcFetcher(api.me.$get())
   ```

### Add a shared validation schema

Create a Zod schema in [`pkg/validations/src`](pkg/validations/src) and import it on **both** the client (forms) and the server (route/auth hooks) for a single source of truth.

### Add a database model

Add a `*.prisma` model under [`pkg/db/prisma/models`](pkg/db/prisma/models), then run `bun run db:gen && bun run db:push`.

### Add a page

Add a route object to [`apps/frontend/src/app/router.tsx`](apps/frontend/src/app/router.tsx) and, if it should be gated, extend the redirect logic in `SessionProvider`.

---

## Production build

```bash
bun run build      # build the frontend → apps/frontend/dist
NODE_ENV=production bun run start
```

The production server serves the static SPA and the API from the same port defined by `PORT`.

---

## Security notes

- **Client/server boundary is enforced.** [`apps/frontend/eslint.config.js`](apps/frontend/eslint.config.js) uses `@typescript-eslint/no-restricted-imports` to block server-only packages (`@repo/db`, `@repo/env`, `@repo/api/auth`, `@repo/utils/logger`) from being imported in frontend code. `@repo/api/_route` is allowed **as a type import only**. This guarantees Prisma, secrets, and server logic never leak into the browser bundle.
- **Secrets never reach the client.** Only `VITE_`-prefixed vars are exposed by Vite; the RPC route type is erased at build time.
- **Passwords are redacted in logs**, and credentials are validated against a strong password policy.
- **Keep `.env` files out of version control** (already covered by `.gitignore`). Rotate any secret that has been shared or committed.

---

Happy building. Feel free to fork and adapt. 🚀
