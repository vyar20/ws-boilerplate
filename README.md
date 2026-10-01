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
- [Testing](#testing)
- [Continuous integration](#continuous-integration)
- [Contributing workflow](#contributing-workflow)
- [Recipes](#recipes)
- [Production build](#production-build)
- [Deploying behind a reverse proxy](#deploying-behind-a-reverse-proxy)
- [Security notes](#security-notes)
- [License](#license)

---

## Tech stack

| Area                      | Technology                                                                |
| ------------------------- | ------------------------------------------------------------------------- |
| Runtime / package manager | **Bun** (workspaces, `--hot`, runs the backend TypeScript directly)       |
| Language                  | **TypeScript**                                                            |
| HTTP server               | **Hono** + Hono RPC (`hc`) client                                         |
| Authentication            | **Better Auth** (email & password)                                        |
| Database                  | **Prisma** ORM + `@prisma/adapter-pg` (**PostgreSQL**)                    |
| Frontend                  | **React 19**, **React Router**, **Vite**                                  |
| Data fetching             | **TanStack Query** (React Query)                                          |
| Forms & validation        | **react-hook-form** + **Zod** (shared schemas)                            |
| UI                        | **Tailwind CSS v4**, **shadcn / base-ui** (incl. Toast), **lucide-react** |
| State management (client) | **Zustand** (theme store in `@repo/context`)                              |
| Logging                   | **Pino** (stdout in production, files in development)                     |
| Tooling                   | **ESLint**, **Prettier**, **pino-pretty** (dev logs)                      |

---

## Features

- 🔒 **Auth out of the box** — sign up / sign in / sign out / session, with password‑strength enforcement.
- 🧩 **End‑to‑end type safety** — the API route type flows to the client as a _type only_; no server code ships to the browser.
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
│   ├── api/            # Hono routes, Better Auth setup, AppType for the RPC client
│   ├── config/         # Shared tsconfig / eslint / prettier / happy-dom test preload
│   ├── context/        # Client state stores (Zustand theme store)
│   ├── db/             # Prisma schema, models, generated client
│   ├── env/            # Zod-validated environment variables
│   ├── react-query/    # TanStack Query hooks (auth) + the RPC & auth clients
│   ├── utils/          # HTTP helpers, error handler, logger
│   └── validations/    # Shared Zod schemas
├── logs/               # Pino log files in development (auto-created, gitignored)
├── LICENSE             # MIT
├── package.json        # Root workspace, scripts, shared tooling devDependencies
└── README.md
```

---

## Packages & apps

Every workspace package is published internally as `@repo/<name>` and consumed via `workspace:*`.

**Dependencies live where they are imported.** Each workspace declares its own runtime
dependencies (including peers such as `zod` for `@hookform/resolvers`). Shared React
packages (`@repo/react-query`, `@repo/context`) list `react` (and `react-dom` where
used) as **`peerDependencies`**, plus `devDependencies` for their tests, so the app
decides which React is installed. The root `package.json` only holds shared tooling
devDependencies (TypeScript types, ESLint, Prettier, test libraries). Add a package
with `bun add <pkg> --cwd <workspace>`, not at the root.

### Apps

| App                 | Description                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`apps/backend`**  | The Hono server. [`app.ts`](apps/backend/src/app.ts) builds the app (security headers + CSP → CSRF check → session middleware → Better Auth handler → auth guard → API routes → `/api` 404 fallback → error handler). [`app-dev.ts`](apps/backend/src/app-dev.ts) runs it with Vite middleware for HMR; [`app-prod.ts`](apps/backend/src/app-prod.ts) serves the static build. Both API and frontend run on **one port**. |
| **`apps/frontend`** | React 19 SPA (Vite + Tailwind v4). Providers for React Query and theme; route guards in [`auth-guard.tsx`](apps/frontend/src/components/auth-guard.tsx); auth forms built with react-hook-form + shared Zod schemas; toasts via the [shadcn base-ui Toast](https://ui.shadcn.com/docs/components/base/toast).                                                                                                             |

### Packages

| Package                 | Purpose                                                                                                                                            | Key exports                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`@repo/api`**         | API layer. Hono route definitions and Better Auth configuration. Exposes the route _type_ (`AppType`) that the RPC client is built from.           | `./client` → `AppType` (type-only), `./_route` (route + `AppType` + `Env`), `./auth` (server-only Better Auth instance)                          |
| **`@repo/db`**          | Prisma client (singleton) + `pg` adapter and the schema/models (`User`, `Session`, `Account`, `Verification`, `RateLimit`).                        | `.` → `db`                                                                                                                                       |
| **`@repo/env`**         | Loads and **validates** `process.env` with Zod. Exits the process on invalid/missing vars, and returns _coerced_ values (e.g. `PORT` as a number). | `.` → `env`                                                                                                                                      |
| **`@repo/validations`** | Shared Zod schemas used on both client and server (sign-in, sign-up, password policy).                                                             | `./sign-in-validation`, `./sign-up-validation`                                                                                                   |
| **`@repo/react-query`** | TanStack Query hooks that wrap the auth client, plus the typed Hono RPC client (`api`) and the Better Auth browser client (`authClient`).          | `./auth/use-session`, `./auth/use-sign-in`, `./auth/use-sign-up`, `./auth/use-sign-out`, `./lib/rpc` (`api`), `./lib/auth-client` (`authClient`) |
| **`@repo/context`**     | Client-side state stores. Currently a Zustand store for the light/dark theme.                                                                      | `./theme-context` (`themeContext`, `getInitialTheme`)                                                                                            |
| **`@repo/utils`**       | Cross-cutting helpers: `HTTPCode`/`HTTPText`, `ErrorHandler`, `EventLogType`, `maskEmail`, a promise-tuple helper `p`, and the Pino `logger`.      | `.` → `utils.ts`, `./logger`                                                                                                                     |
| **`@repo/config`**      | Shared `tsconfig` base, ESLint config, Prettier config, and the happy-dom test preload.                                                            | `./tsconfig`, `./eslint`, `./prettier`, `./happydom`                                                                                             |

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

Create the backend env file (see [Environment variables](#environment-variables) for details):

**`apps/backend/.env`**

```dotenv
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
BETTER_AUTH_SECRET=replace-with-a-random-string-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
# ENCRYPTION_KEY=optional-not-used-yet-min-32-chars
```

> The frontend needs **no env file**. Because the API and the SPA are served from
> a single origin, the browser calls the API via a relative `/api` path — no
> build-time base URL is required.

> Generate strong secrets with: `openssl rand -base64 32`

### 4. Set up the database

```bash
bun run db:gen         # generate the Prisma client
bun run db:migrate     # apply the committed migrations to your database
```

> `db:migrate` applies the migration history in [`pkg/db/prisma/migrations`](pkg/db/prisma/migrations)
> and keeps your database in sync as new migrations land. For quick, throwaway
> prototyping you can use `bun run db:push` instead — it syncs the schema without
> recording a migration, so don't use it on shared or production databases.

### 5. (Optional) Seed dev users

```bash
bun run db:seed
```

Creates `admin@example.com` plus `user-0@example.com` … `user-99@example.com` through
Better Auth's sign-up API, 10 at a time. It is safe to re-run: users whose email already
exists are skipped, and the run reports how many were created and skipped.

- **Password:** set `SEED_PASSWORD` (must pass the password policy) to choose it. If unset,
  a random policy-compliant password is generated and **printed once** at the end; it is
  not stored anywhere, so copy it then.
- **Safety guard:** the seed only runs when the `DATABASE_URL` host is `localhost`,
  `127.0.0.1` or `::1`. For any other host it prints the detected host (never the
  credentials) and exits with code `1` before connecting. Set `ALLOW_SEED=true` to seed a
  non-local database such as a shared staging DB.

> ⚠️ **Never run the seed against a production database**, with or without `ALLOW_SEED`.
> It creates well-known accounts that share one password.

`SEED_PASSWORD` and `ALLOW_SEED` are read only by the seed, so they are not part of the
validated env schema in `@repo/env`.

### 6. Run the dev server

```bash
bun run dev
```

Open **http://localhost:3000**. The frontend and the API are both served from this single port.

---

## Environment variables

Validated in [`pkg/env/src/env.ts`](pkg/env/src/env.ts). The app **won't start** if a required variable is missing or any variable is invalid.

### Backend — `apps/backend/.env`

| Variable                  | Type / rule                                  | Description                                                                                                                                            |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                    | number                                       | Port the server listens on.                                                                                                                            |
| `DATABASE_URL`            | starts with `postgres://` or `postgresql://` | PostgreSQL connection string.                                                                                                                          |
| `BETTER_AUTH_SECRET`      | string, min 32 chars                         | Secret used by Better Auth to sign sessions.                                                                                                           |
| `BETTER_AUTH_URL`         | URL starting with `http`                     | Public URL of the app (`https://…` in production). Also the only allowed `Origin` for the CSRF check.                                                  |
| `ENCRYPTION_KEY`          | **optional**; if set, string, min 32 chars   | Reserved for app-level encrypt/decrypt. Not used by the code yet.                                                                                      |
| `TRUSTED_PROXY_IP_HEADER` | **optional**; a single header name           | Header your reverse proxy sets with the client IP (e.g. `x-forwarded-for`). See [Deploying behind a reverse proxy](#deploying-behind-a-reverse-proxy). |

`NODE_ENV` (`development` | `production`) is still validated but **not set in `.env`**: each
script sets it for you.

- `production`: `start`, `db:migrate:deploy`, `db:migrate:status`
- `development`: `dev`, `test:integration`, `auth:gen`, and every other `db:*` script

Run any other entry point that imports `@repo/env` with `NODE_ENV` set, or it exits on startup.

### Frontend

The frontend requires **no environment variables**. The API and the SPA are served
from the same origin (single-port serving), so the browser reaches the API through a
relative `/api` path and Better Auth falls back to `window.location.origin` — no
build-time base URL is needed.

> ⚠️ If you ever split the frontend and backend onto **different origins**, reintroduce a
> `VITE_`-prefixed base URL (e.g. `VITE_BACKEND_URL`) and pass it to both clients: `hc()` in
> [`rpc.ts`](pkg/react-query/src/lib/rpc.ts) and `createAuthClient({ baseURL })` in
> [`auth-client.ts`](pkg/react-query/src/lib/auth-client.ts). You will also need CORS on the backend.
> Only `VITE_`-prefixed variables are exposed to the browser; server secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, …) are **never** shipped to the client.

---

## Scripts

Run from the repo root; each fans out across workspaces via `bun --filter '*'`.

| Script                      | What it does                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`               | Start the backend in dev mode (Hono + Vite HMR) on one port.                                                                                |
| `bun run build`             | Build the frontend for production.                                                                                                          |
| `bun run start`             | Start the backend in production mode (serves the static build).                                                                             |
| `bun run test`              | Run the unit test suites in each workspace that defines a `test` script. No database needed.                                                |
| `bun run test:integration`  | Run `*.integration.test.ts` against the real database in `apps/backend/.env`. See [Integration tests](#integration-tests).                  |
| `bun run lint`              | Run ESLint in every workspace.                                                                                                              |
| `bun run typecheck`         | Run `tsc --noEmit` in every workspace.                                                                                                      |
| `bun run db:gen`            | Generate the Prisma client.                                                                                                                 |
| `bun run db:push`           | Push the Prisma schema to the database (no migration history — dev/prototyping only).                                                       |
| `bun run db:seed`           | Seed **local** dev users (runs [`apps/backend/src/seed.ts`](apps/backend/src/seed.ts)). See [Seeding](#5-optional-seed-dev-users).          |
| `bun run db:migrate`        | Create and apply a new migration in development (`prisma migrate dev`).                                                                     |
| `bun run db:migrate:reset`  | ⚠️ **Drops all data**, then re-applies every migration (`prisma migrate reset --force`). Dev only.                                          |
| `bun run db:migrate:deploy` | Apply all pending migrations without generating new ones (`prisma migrate deploy`) — for CI and production.                                 |
| `bun run db:migrate:status` | Show the status of migrations against the database.                                                                                         |
| `bun run db:std`            | Open Prisma Studio.                                                                                                                         |
| `bun run auth:gen`          | Generate Better Auth's Prisma models. ⚠️ Overwrites `schema.prisma` with **all** models; see [Add a database model](#add-a-database-model). |
| `bun run del`               | Remove all `node_modules`/build output.                                                                                                     |

---

## Routes

### Backend (Hono)

| Method | Path               | Auth        | Description                                                                         |
| ------ | ------------------ | ----------- | ----------------------------------------------------------------------------------- |
| `ALL`  | `/api/auth/*`      | Public      | Better Auth handler (sign-up, sign-in, sign-out, get-session, …).                   |
| `GET`  | `/api`             | 🔒 Required | Example route → `{ "message": "Hello from hono" }`.                                 |
| `ALL`  | `/api/*` (unknown) | 🔒 Required | Fallback in [`app.ts`](apps/backend/src/app.ts) → `404 { "message": "NOT_FOUND" }`. |
| `*`    | everything else    | Public      | Served by the SPA (Vite in dev, static `index.html` in prod).                       |

Everything under `/api/*` (except `/api/auth/*`) is protected by the [`isAuthenticated`](apps/backend/src/middleware/is-authenticated-middleware.ts) middleware, so an unknown `/api` path returns `401` to signed-out users and `404` to signed-in ones.

The 404 fallback is registered in [`app.ts`](apps/backend/src/app.ts) right after `app.route('/api', _route)`, not inside `_route`. Routes in [`_route.ts`](pkg/api/src/_route.ts) can therefore be chained in any order, and `AppType` contains only real routes.

### Auth endpoints (Better Auth)

| Method | Path                      | Body                        |
| ------ | ------------------------- | --------------------------- |
| `POST` | `/api/auth/sign-up/email` | `{ name, email, password }` |
| `POST` | `/api/auth/sign-in/email` | `{ email, password }`       |
| `POST` | `/api/auth/sign-out`      | —                           |
| `GET`  | `/api/auth/get-session`   | —                           |

**Password policy** (enforced in [`pkg/validations`](pkg/validations/src/sign-in-validation.ts)): at least **12 characters**, with an uppercase letter, a lowercase letter, a number, and a symbol. It applies to **sign-up** (form + server hook) and Better Auth also enforces `minPasswordLength: 12` for any future reset/change-password flow. **Sign-in** only requires a non-empty password, so accounts created under an older policy can still log in.

### Frontend (React Router)

| Path         | Page              | Notes                                                |
| ------------ | ----------------- | ---------------------------------------------------- |
| `/`          | Sign in / Sign up | Redirects to `/dashboard` when authenticated.        |
| `/dashboard` | Dashboard         | Shows the session; redirects to `/` when signed out. |

Redirects are handled by the route guards in [`auth-guard.tsx`](apps/frontend/src/components/auth-guard.tsx), wired up in [`router.tsx`](apps/frontend/src/app/router.tsx):

- `ProtectedRoute` sends signed-out users to `/`, remembering the page they came from.
- `PublicOnlyRoute` sends signed-in users back to that page, or to `/dashboard`.

---

## How it works

### Single-port serving

In development, [`app-dev.ts`](apps/backend/src/app-dev.ts) routes `/api*` requests to Hono and everything else to Vite's middleware (HMR). In production, [`app-prod.ts`](apps/backend/src/app-prod.ts) serves the built assets and falls back to `index.html` for client-side routing. One process, one port.

### End-to-end type safety (Hono RPC)

The client is typed with `hc<AppType>()`, where `AppType` is the _type_ of the Hono route tree. [`@repo/api/client`](pkg/api/src/client.ts) re-exports only `type AppType`, and [`rpc.ts`](pkg/react-query/src/lib/rpc.ts) imports it **type-only**, so the actual server code is erased at build time — the browser bundle never contains route handlers, Prisma, or secrets. The client/server boundary ESLint rule enforces this by allowing `@repo/api/_route` as a type import only.

### Auth flow

`authClient` (better-auth/react) talks to `/api/auth/*`. The [React Query hooks](pkg/react-query/src/auth) wrap it and invalidate the cached `['auth', 'session']` query after sign-in/up/out so route guards react to the fresh state. `sessionMiddleware` attaches the session (or `null`) to the context of every `/api/*` request.

### Error handling & logging

Throw an `ErrorHandler(message, code, reason)` from [`@repo/utils`](pkg/utils/src/utils.ts) anywhere in the API; the global `onError` serializes it to a clean JSON response and logs it via Pino. `4xx` errors (bad input, missing session, CSRF rejections) are logged with `logger.warn`; `5xx` and unexpected errors with `logger.error`. Unexpected errors return a generic `INTERNAL_SERVER_ERROR` — internal details are logged, never sent to the client.

Where logs go ([`logger.ts`](pkg/utils/src/logger.ts)):

- **Production:** stdout, as JSON.
- **Development:** pretty-printed to the terminal (`pino-pretty`) **and** written to
  `logs/info.log` / `logs/error.log`. The folder is created automatically.

---

## Testing

Unit tests run on **Bun's built-in test runner** (`bun test`). Test files live next to
the code they cover and use the `*.test.ts` suffix (e.g.
[`pkg/utils/src/utils.test.ts`](pkg/utils/src/utils.test.ts),
[`pkg/validations/src/sign-in-validation.test.ts`](pkg/validations/src/sign-in-validation.test.ts)).
Every workspace — all `pkg/*` packages plus `apps/backend` and `apps/frontend` — has a suite.

```bash
bun run test            # run the suite in every workspace that defines a `test` script
bun test path/to/file   # run a single file while iterating
```

**React code** (`apps/frontend`, `pkg/react-query`, `pkg/context`) is tested with
[`@testing-library/react`](https://testing-library.com/docs/react-testing-library/intro/)
against a [happy-dom](https://github.com/capricorn86/happy-dom) DOM. Each of those
workspaces has a `bunfig.toml` that preloads [`@repo/config/happydom`](pkg/config/happydom.ts).
Call `cleanup` in `afterEach`, since Bun does not run Testing Library's auto-cleanup.
External boundaries (Better Auth, Prisma, env, logger, router) are replaced with
`mock.module` so suites need no database or network.

Frontend test files are excluded from `tsconfig.app.json` (so `bun:test` types
never reach the browser build) and type-checked by `tsconfig.test.json` instead.

### Integration tests

`*.integration.test.ts` files run the real stack (Better Auth, Prisma, `@repo/env`)
against a real Postgres, with nothing mocked. [`auth.integration.test.ts`](apps/backend/src/auth.integration.test.ts)
walks sign-up → weak password → duplicate email → wrong password → sign-in → `GET /api`
→ sign-out through `app.request()`, and spies on the logger to check that only the
successful steps log `USER_CREATED` / `USER_LOGGED_IN`.

```bash
bun run db:migrate:deploy   # the database in apps/backend/.env must be migrated
bun run test:integration
```

- **Needs a database:** it uses `DATABASE_URL` from `apps/backend/.env`. Point it at a
  local dev or throwaway database, never a shared or production one. To use another
  database for one run: `DATABASE_URL=postgresql://…/test_db bun run test:integration`.
- **Cleans up after itself:** each run uses a unique email and deletes that user (and
  its sessions/accounts) in `afterAll`.
- **Kept out of `bun run test`:** the unit `test` script ignores
  `**/*.integration.test.ts`, so unit tests never need a database.

**Always ship code with tests.** Every change to behavior — a new API route, a
validation schema, a utility, a bug fix — must come with unit tests that cover the
happy path and the meaningful failure/edge cases (invalid input, auth denials,
boundary values). Keep the suite green before opening a pull request:

```bash
bun run test
```

---

## Continuous integration

[`.github/workflows/ci.yaml`](.github/workflows/ci.yaml) runs on every pull request to `master` and on every push to `master` (so the merged result is checked too):

1. Starts a **PostgreSQL 16** service container.
2. Installs dependencies with the Bun version pinned in `packageManager` (`--frozen-lockfile`).
3. Writes a dummy `apps/backend/.env` (no `NODE_ENV`, same as local).
4. Applies migrations with `db:migrate:deploy`, then runs `db:gen`.
5. Runs `lint`, unit `test`, `test:integration` (against the Postgres service),
   `typecheck` and `build`. The job is named `lint - test - typecheck - build`.

A PR should not be merged until this check is green.

### Dependency updates

[`.github/dependabot.yml`](.github/dependabot.yml) checks **weekly** for updates to Bun
packages (the root `bun.lock`, which covers every workspace) and GitHub Actions:

- All **minor and patch** updates are grouped into **one PR** per ecosystem.
- Each **major** update gets its **own PR per package**, so breaking changes are reviewed one at a time.
- At most **5** Dependabot PRs are open at once per ecosystem.
- **TypeScript is pinned:** Dependabot ignores `typescript` entirely (no major, minor or
  patch PRs). It stays at the version in `apps/frontend/package.json` (`~6.0.2`, locked
  to 6.0.3) until someone upgrades it deliberately. `typescript-eslint` is still updated.

Dependabot PRs go through the same CI as any other PR.

---

## Contributing workflow

Follow this loop for every task so the repo stays healthy and reviewable:

1. **Write (or update) unit tests.** New behavior and bug fixes land with tests
   next to the code (`*.test.ts`). Cover the happy path plus the meaningful edge
   and failure cases. Run `bun run test` and make sure everything passes.
2. **Update this README when needed.** If a change adds or alters a script, route,
   environment variable, package, or workflow, reflect it here in the same change
   so the docs never drift from the code.
3. **Open a pull request when the task is done.** Work on a feature branch, keep
   commits focused, and open a PR once the task is complete and the suite is green.
   Describe what changed, why, and how it was tested. Don't commit directly to
   `master`.

---

## Recipes

### Add a new (protected) API route

1. Chain the route onto the app in [`pkg/api/src/_route.ts`](pkg/api/src/_route.ts):

   ```ts
   export const _route = new Hono<Env>()
     .get("/", (c) => c.json({ message: "Hello from hono" }))
     .get("/me", (c) => {
       const session = c.get("session"); // typed, provided by middleware
       return c.json({ user: session?.user ?? null });
     });
   ```

   Order does not matter, and there is no catch-all to keep last: unknown `/api` paths
   get their JSON 404 from [`app.ts`](apps/backend/src/app.ts).

2. `AppType` updates automatically — the frontend RPC client is instantly typed for `/api/me`. Because the route lives under `/api`, it's protected by the auth guard by default.

3. Call it from the frontend with the typed RPC client. `api` is the `hc<AppType>()`
   client exported from [`@repo/react-query/lib/rpc`](pkg/react-query/src/lib/rpc.ts);
   it's already configured with `credentials: 'include'` and the `/api` base path:

   ```ts
   import { api } from "@repo/react-query/lib/rpc";

   const res = await api.me.$get();
   const data = await res.json(); // fully typed from the route definition
   ```

   In practice, wrap this in a TanStack Query hook next to the auth hooks in
   [`pkg/react-query/src/auth`](pkg/react-query/src/auth) so the frontend consumes it
   the same way as `useSession`.

### Add a shared validation schema

Create a Zod schema in [`pkg/validations/src`](pkg/validations/src) and import it on **both** the client (forms) and the server (route/auth hooks) for a single source of truth.

### Add a database model

Add a `*.prisma` model under [`pkg/db/prisma/models`](pkg/db/prisma/models) (one file per model), then run `bun run db:migrate` to
create a migration and apply it (this also regenerates the Prisma client). Commit the generated
folder under [`pkg/db/prisma/migrations`](pkg/db/prisma/migrations) alongside your schema change so
the migration history stays in sync across environments — CI applies it via `db:migrate:deploy`.

**Models that Better Auth needs** (e.g. after enabling a plugin or a new storage option):
`bun run auth:gen` rewrites `pkg/db/prisma/schema.prisma` with **every** model, which
duplicates the ones in `prisma/models/` and breaks Prisma. Copy only the new model into its
own file under `prisma/models/` (as done for [`rate-limit.prisma`](pkg/db/prisma/models/rate-limit.prisma)),
then restore `schema.prisma` with `git checkout pkg/db/prisma/schema.prisma` and run
`bun run db:migrate`.

### Add a page

Add a route object to [`apps/frontend/src/app/router.tsx`](apps/frontend/src/app/router.tsx). Put it under the `ProtectedRoute` group if it requires sign-in, or under `PublicOnlyRoute` if only signed-out users should see it.

---

## Production build

```bash
bun run build      # build the frontend → apps/frontend/dist
bun run start      # sets NODE_ENV=production
```

The production server serves the static SPA and the API from the same port defined by `PORT`.

`NODE_ENV` is set by the script, not by `.env`: `bun run start` runs
`NODE_ENV=production bun src/app-prod.ts`. If you start the server some other way, for
example `bun src/app-prod.ts` directly in a Dockerfile, **set `NODE_ENV=production`
yourself**. Without it, env validation in [`@repo/env`](pkg/env/src/env.ts) fails and the
process exits on startup.

```dockerfile
ENV NODE_ENV=production
CMD ["bun", "apps/backend/src/app-prod.ts"]
```

In production, logs are written to **stdout** as JSON (collect them with your platform's
log driver). The `logs/` files are only used in development.

Run `bun run db:migrate:deploy` before starting a new version. Rate limiting needs the
`rateLimit` table; without it Better Auth logs a schema mismatch at startup.

---

## Deploying behind a reverse proxy

Typical setup: nginx, Caddy, a load balancer or a PaaS router terminates TLS and forwards
plain HTTP to the Bun server.

1. **`BETTER_AUTH_URL` must be the public URL**, e.g. `https://app.example.com`, not the
   internal `http://localhost:3000`. Better Auth builds callback URLs and checks trusted
   origins from it, and the CSRF check compares the browser's `Origin` against its origin.
   The request URL the app sees is `http://…` behind the proxy, so it cannot be used for
   that check.
2. **Set `TRUSTED_PROXY_IP_HEADER`** to the header your proxy writes with the client IP,
   e.g. `x-forwarded-for` (nginx, most load balancers) or `cf-connecting-ip` (Cloudflare).
   Better Auth then reads the client IP **only** from that header. Make sure the proxy
   **overwrites** the header instead of appending to what the client sent, otherwise
   clients can choose their own IP. Leave it unset to keep Better Auth's default headers.
3. **Rate limiting needs a real client IP.** Better Auth rate-limits auth endpoints in
   production (e.g. 3 sign-in attempts per 10 s per IP). When no IP header is present,
   every request is counted under one shared `no-trusted-ip` key, so a few failed logins
   from anyone block sign-in for everyone. This happens when the server is exposed
   directly without a proxy, or when the proxy's header is not configured.
4. **Why the counters live in Postgres** (`rateLimit.storage: 'database'`): with the
   default in-memory storage each instance keeps its own counters, so running N instances
   gives an attacker N times the limit, and every restart resets it. The `rateLimit`
   table is shared by all instances.

---

## Security notes

- **Client/server boundary is enforced.** [`apps/frontend/eslint.config.js`](apps/frontend/eslint.config.js) uses `@typescript-eslint/no-restricted-imports` to block server-only packages (`@repo/db`, `@repo/env`, `@repo/api/auth`, `@repo/utils/logger`) from being imported in frontend code. `@repo/api/_route` is allowed **as a type import only**. This guarantees Prisma, secrets, and server logic never leak into the browser bundle.
- **Secrets never reach the client.** The frontend ships with no env file, so no build-time values are baked into the bundle; only `VITE_`-prefixed vars would ever be exposed by Vite, and the RPC route type is erased at build time.
- **Auth logs are allowlisted and success-only.** `USER_LOGGED_IN` / `USER_CREATED` are written from Better Auth's `after` hook only when a new session was created, so failed attempts are never logged as successes. They record only the masked email, never the raw request body or password.
- **Passwords are hashed with argon2id** (Bun's `Bun.password` default). Existing **bcrypt** hashes still verify: `Bun.password.verify` detects the algorithm from the hash format (covered by a test in [`auth.test.ts`](pkg/api/src/lib/auth.test.ts)). Users with a bcrypt hash keep it until their password is changed.
- **Security headers** on every response via Hono's [`secureHeaders()`](https://hono.dev/docs/middleware/builtin/secure-headers) (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, HSTS, `Referrer-Policy`, …).
- **Content-Security-Policy** on every response served by Hono, which includes the production SPA (`index.html` and assets): `default-src 'self'`, `script-src 'self'` (no `'unsafe-eval'`, no inline scripts), `style-src 'self' 'unsafe-inline'`, `img-src`/`font-src 'self' data:`, `connect-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`. In development the HTML comes from Vite, not Hono, so the CSP does not apply there. Zod is set to `jitless` in [`zod-config.ts`](apps/frontend/src/lib/zod-config.ts) because its `Function('')` eval probe would otherwise trip `script-src`. If you add a third-party script, font or API origin, add it to the matching directive in [`app.ts`](apps/backend/src/app.ts).
- **CSRF protection** on `/api/*` via Hono's [`csrf()`](https://hono.dev/docs/middleware/builtin/csrf): cross-site **form-style** writes (`application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`, or no content type) are rejected with `403` unless `Sec-Fetch-Site` says same-origin or `Origin` equals the origin of `BETTER_AUTH_URL`. Cross-origin JSON requests are blocked by the browser's CORS preflight, since no CORS is enabled. Comparing against `BETTER_AUTH_URL` (not the request URL) keeps this correct behind a TLS-terminating proxy; see [Deploying behind a reverse proxy](#deploying-behind-a-reverse-proxy).
- **Keep `.env` files out of version control** (already covered by `.gitignore`). Rotate any secret that has been shared or committed.

---

## License

[MIT](LICENSE) © 2026 vyar20

---

Happy building. Feel free to fork and adapt. 🚀
