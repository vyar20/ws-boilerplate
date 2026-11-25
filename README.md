# WS-Boilerplate

## Introduction

This repo was made from [Bun](https://bun.sh/) + [Vite + React](https://vite.dev/) + [Hono](https://hono.dev/) with [Better-Auth](https://better-auth.com/) for authentication.
The reason why i built this is because it's really painfull to setup everything from scratch, with this we only need to focusing on building something instead of focusing on build everything from zero.
Feel free to clone / fork and enjoy building❤️

## Table of contents

- [Tech Stack](#tech-stach)
- [Feature](#feature)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environtment Variable](#environtment-variable)

## Tech Stack

| Area               |                                                                                                                  Technology |
| :----------------- | --------------------------------------------------------------------------------------------------------------------------: |
| **Runtime**        |                                                                                                       [Bun](https://bun.sh) |
| **Backend**        |                                                                                                   [Hono](https://hono.dev/) |
| **Authentication** |                                                                                     [Better-Auth](https://better-auth.com/) |
| **Frontend**       |                                                                                           [Vite + React](https://vite.dev/) |
| **Data Fetching**  |                                                                  [@tanstack/react-query](https://tanstack.com/query/latest) |
| **Forms**          | [react-query-form](https://react-hook-form.com/) + [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers) |
| **Database**       |                                                                                   [Postgresql](https://www.postgresql.org/) |
| **Database ORM**   |                                                                                      [prisma@7](https://www.prisma.io/docs) |
| **Validation**     |                                                                                                     [Zod](https://zod.dev/) |
| **Logging**        |                                                                              [Pino](https://getpino.io/#/) > File & Console |

## Feature

- **Authentication**: Support multiple authentication (Email + Password, Social Provider: Google, Github, X, [read docs for more authentication method and docs](https://better-auth.com))
- **Database**: [Postgresql](https://www.postgresql.org/)
- **ORM**: Use [Prisma ORM](https://www.prisma.io/docs) as our ORM to help us manage Database and typesafe.
- **End-to-end typesafe APIs**: All APIs have end to end typesafe, by utilizing [RPC](https://hono.dev/docs/guides/rpc) from [Hono](https://hono.dev)
- **Frontend**: Build using [Vite + React](https://vite.dev/). Make us easier to make fast + modern Web App
- **Backend**: Build using [Hono](https://hono.dev). Fast, lightweight, built on Web Standards

## Folder Structure

```
/
|-  apps/                   # Applications
    |- backend/             # Backend App - Hono
    |- frontend/            # Frontend App - Vite + React
|-  pkg/                    # Sharing packages
    |- config/              # tsconfig, prettier, and eslint configs
    |- env/                 # env guard with zod
    |- utils/               # sharing utility
|-  .env.example            # example of .env
|-  .gitignore              #
|-  bun.lock                #
|-  compose.yaml            #
|-  Dockerfile              #
|-  package.json            #
|-  README.md               #
```

## Packages & Apps

### Apps

| App           |                 Description |
| :------------ | --------------------------: |
| apps/backend  |       Hono server build app |
| apps/frontend | SPA built with Vite + React |

### Packages

| Packages   |                                                                                   Description |
| :--------- | --------------------------------------------------------------------------------------------: |
| pkg/config |                                                    Shared config (tsconfig, prettier, eslint) |
| pkg/env    | Environtment variable guard that will stop if variable not comply with type that has been set |
| pkg/utils  |                                            Shared utility (separated client + Server) utility |

## Prerequisites

- Bun@1.4.4
- postgresql (local / hosted)

## Getting Started

### 1. Clone or Fork Repo

#### Clone

Clone repo on your computer

```bash
git clone https://github.com/vyar20/slack-dm.git <your folder>
cd <your folder>
```

#### Fork

Fork repo on your computer

```bash
gh repo fork https://github.com/vyar20/slack-dm.git
```

### 2. Configure .env

Copy .env.example to .env and fill up all the variables. Follow [Environtment Variable](#environtment-variable) for Guidelines
**Note: For NODE_ENV no need to add on [.env](.env) since it's already included on scripts for development and production**

```bash
cp .env.example .env
```

```dotenv
PORT=3000
DATABASE_URL=postgres://postgres@localhost:5432/<your-database>
```

### 3. Setup Database

```bash
bun run db:push     # Push database schema on database
bun run db:gen      # Generate types Prisma Client
```

### 4. Run Server

#### Development Mode

```bash
bun run dev         # Start database on development
```

#### Production Mode

```bash
bun run start         # Start database on production
```

## Environtment Variable

Environtment Variables validated on [`/pkg/env/src/env.ts`](pkg/env/src/env.ts). Make sure all variables already set on **envSchema** variables. Every environtment variables needs to set on [`/pkg/env/src/env.ts`](pkg/env/src/env.ts) if you add new variables

| Variable         | Type                                                  |                        Description |
| :--------------- | ----------------------------------------------------- | ---------------------------------: |
| **NODE_ENV**     | enum one of `development \| production`               |                       Runtime mode |
| **PORT**         | number (coerced)                                      | Where app running on spesific port |
| **DATABASE_URL** | Database URL should start with `postgres\|postgresql` |       Postgresql connection string |
