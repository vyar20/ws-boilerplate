# WS-Boilerplate

A full-stack TypeScript monorepo powered by Bun, Hono, Vite, React, and Better Auth.

WS-Boilerplate provides a reusable foundation for building modern web applications without setting up authentication, database access, shared utilities, and development tooling from scratch. Spend less time configuring your project and more time building features.

Feel free to clone, fork, and adapt this project to your needs.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Authentication](#authentication)
- [Docker](#docker)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime and package manager | [Bun](https://bun.sh/) |
| Backend | [Hono](https://hono.dev/) |
| Frontend | [Vite](https://vite.dev/) + [React](https://react.dev/) |
| Authentication | [Better Auth](https://better-auth.com/) |
| Data fetching | [TanStack Query](https://tanstack.com/query/latest) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Resolvers](https://github.com/react-hook-form/resolvers) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Prisma 7](https://www.prisma.io/docs) |
| Validation | [Zod](https://zod.dev/) |
| Logging | [Pino](https://getpino.io/) (file and console) |
| Email | [Nodemailer](https://nodemailer.com/) |
| Containerization | [Docker](https://docs.docker.com/) |

## Features

- Bun workspaces for managing applications and shared packages.
- Email/password authentication and social provider configuration for Google, GitHub, and X (Twitter).
- Session middleware for protecting backend API routes while keeping authentication endpoints accessible.
- Type-safe API development using [Hono RPC](https://hono.dev/docs/guides/rpc).
- PostgreSQL database access through Prisma ORM.
- Environment variable validation using Zod.
- Shared TypeScript, ESLint, and Prettier configuration.
- Shared client-side and server-side utilities.
- Structured logging and email delivery support.
- Docker and Docker Compose configuration.

> **Development status:** Authentication work currently focuses on the backend. Frontend authentication integration and end-to-end social sign-in testing are pending.

## Project Structure

```text
.
├── apps/
│   ├── backend/          # Hono API server
│   └── frontend/         # Vite + React SPA
├── pkg/
│   ├── auth/             # Better Auth configuration
│   ├── db/               # Prisma configuration and models
│   ├── config/           # Shared development configuration
│   ├── env/              # Environment variable validation
│   └── utils/            # Shared client and server utilities
├── .env.example
├── .gitignore
├── bun.lock
├── compose.yaml
├── Dockerfile
├── package.json
└── README.md
```

### Applications

| Application | Description |
| --- | --- |
| `apps/backend` | Backend API built with Hono. |
| `apps/frontend` | Single-page application built with Vite and React. |

### Shared Packages

| Package | Description |
| --- | --- |
| `pkg/auth` | Centralized Better Auth configuration. |
| `pkg/db` | Prisma configuration, schema, and database access. |
| `pkg/config` | Shared TypeScript, ESLint, and Prettier configuration. |
| `pkg/env` | Zod-based environment validation. |
| `pkg/utils` | Shared utilities with separate client and server concerns. |

## Prerequisites

- [Bun](https://bun.sh/) 1.4.4 (project reference version).
- A running PostgreSQL instance (local or hosted).
- Git.
- GitHub CLI (optional, for contributing).
- Docker and Docker Compose (optional, for containerized execution).

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vyar20/ws-boilerplate.git
cd ws-boilerplate
```

Alternatively, fork and clone the repository using GitHub CLI:

```bash
gh repo fork vyar20/ws-boilerplate --clone
```

### 2. Install dependencies

```bash
bun install --frozen-lockfile
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Populate the required values using [Environment Variables](#environment-variables) as a guide. Create the PostgreSQL database before proceeding. Never commit real credentials or the local `.env` file.

### 4. Set up the database

```bash
bun run db:push
bun run db:gen
```

`db:push` synchronizes the schema with the development database. For production, prefer reviewed Prisma migrations rather than directly pushing schema changes.

### 5. Start development

```bash
bun run dev
```

Use the URLs printed by the development servers.

### 6. Run in production

```bash
bun run build
bun run start
```

Configure production environment variables and apply any required database migrations before starting the application. Confirm that the root build and start scripts match your deployment target.

## Environment Variables

Environment variables are validated in [`pkg/env/src/env.ts`](pkg/env/src/env.ts). Update the validation schema and `.env.example` whenever new variables are introduced.

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Runtime mode (`development` or `production`); set by the application scripts. |
| `PORT` | Application port, coerced to a number. |
| `DATABASE_URL` | PostgreSQL connection URL. |
| `BETTER_AUTH_BASE_URL` | Authentication base URL, including HTTP or HTTPS scheme. |
| `BETTER_AUTH_SECRET` | Authentication secret, at least 32 characters. |
| `BETTER_AUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID. |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `BETTER_AUTH_GITHUB_CLIENT_ID` | GitHub OAuth client ID. |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret. |
| `BETTER_AUTH_X_CLIENT_ID` | X OAuth client ID. |
| `BETTER_AUTH_X_CLIENT_SECRET` | X OAuth client secret. |

Example local configuration:

```dotenv
PORT=3000
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE
BETTER_AUTH_BASE_URL=http://localhost:3000
BETTER_AUTH_SECRET=REPLACE_WITH_A_RANDOM_SECRET
```

Generate a secret using:

```bash
openssl rand -base64 32
```

Add the OAuth and email credentials required by your environment schema. Refer to `.env.example` and the actual validation schema for the authoritative list; SMTP variable names are not specified here.

## Database

Database models are located in [`pkg/db/prisma/models/`](pkg/db/prisma/models/).

| Model | Purpose |
| --- | --- |
| [User](pkg/db/prisma/models/user.prisma) | User profile, unique email, verification status, and relationships. |
| [Account](pkg/db/prisma/models/account.prisma) | Authentication provider accounts, credentials, and token metadata. |
| [Session](pkg/db/prisma/models/session.prisma) | Session tokens, expiration, and client metadata. |
| [Verification](pkg/db/prisma/models/verification.prisma) | Verification identifiers, values, and expiration. |

A user can have multiple accounts and sessions. The Prisma model files are the source of truth for fields, constraints, and indexes.

## Authentication

Authentication is managed by [Better Auth](https://better-auth.com/) and configured in [`pkg/auth/src/server-auth.ts`](pkg/auth/src/server-auth.ts).

### Email and Password

The intended email/password workflow requires users to verify their email addresses. Verification links are logged during development and delivered by email in production when email verification and delivery are configured.

Email delivery uses Nodemailer with Gmail SMTP and an [App Password](https://myaccount.google.com/apppasswords). Configure the required credentials before enabling email delivery.

### Social Providers

The backend configuration includes Google, GitHub, and X (Twitter). Create OAuth applications with each provider and configure their client IDs and secrets.

With Better Auth's default `/api/auth` base path, register callback URLs in the following format:

```text
<AUTH_BASE_URL>/api/auth/callback/google
<AUTH_BASE_URL>/api/auth/callback/github
<AUTH_BASE_URL>/api/auth/callback/twitter
```

Adjust the URLs if your authentication base path differs. See the [Better Auth documentation](https://better-auth.com/docs) for provider-specific setup.

### Session Middleware

The [session middleware](apps/backend/src/middleware/session-middleware.ts) is intended to require valid sessions for protected `/api/*` routes. Authentication endpoints must remain accessible without an existing session where required by the authentication flow.

Verify that unauthenticated requests return `401 Unauthorized`, authenticated requests succeed, and authentication endpoints are not blocked by the middleware.

### Session Expiration

The intended default session lifetime is eight hours. Better Auth expects `session.expiresIn` in seconds:

```ts
const sessionDuration = 60 * 60 * 8

// Inside the Better Auth configuration:
// session: { expiresIn: sessionDuration }
```

Update the duration in `pkg/auth/src/server-auth.ts` as needed.

## Docker

The repository includes a `Dockerfile` and `compose.yaml`. Review their service definitions, ports, and environment configuration before running the application.

### Docker Compose

```bash
docker compose up -d --build
docker compose logs -f
```

Stop and remove the Compose containers and networks:

```bash
docker compose down
```

### Docker CLI

Assuming the application listens on port 3000 and the Dockerfile builds the runnable application:

```bash
docker build -t ws-boilerplate .
docker run -d --name ws-boilerplate --env-file .env -p 3000:3000 ws-boilerplate
```

If PostgreSQL runs on your host rather than inside the container, `localhost` inside the container will not refer to the host. On Docker Desktop, use `host.docker.internal` where appropriate. For a Compose-managed database, use its service name.

## Development Workflow

Use short-lived feature branches and pull requests to keep the default branch stable.

```bash
git switch -c feat/your-feature
# Make changes and review git diff.
git add .
git commit -m "feat(scope): describe your change"
git push -u origin HEAD
```

Before opening a pull request, run the available lint, type-check, test, and build scripts defined in `package.json`. Review the diff for unrelated changes and sensitive information.

## Contributing

Contributions, bug reports, and suggestions are welcome.

Keep pull requests focused on a single objective. Use descriptive branch names and Conventional Commit-style titles, such as `feat(auth): add session middleware`.

If the repository includes `.github/pull_request_template.md`, use it to document the summary, reason, changes, testing instructions, and impact. To prepare a description locally:

```bash
cp .github/pull_request_template.md pr-description.md
# Edit pr-description.md before creating the PR.
gh pr create --title "feat(scope): describe your change" --body-file pr-description.md
```

Keep `/pr-description.md` in `.gitignore` if it is used as a temporary local file. Report tests that have not been performed and any limitations honestly. Merge only after applicable checks and reviews are complete.
