# WS-Boilerplate

## Introduction

This repo was made from [Bun](https://bun.sh/) + [Vite + React](https://vite.dev/) + [Hono](https://hono.dev/) with [Better-Auth](https://better-auth.com/) for authentication.\
The reason why i built this is because it's really painfull to setup everything from scratch, with this we only need to focusing on building something instead of focusing on build everything from zero.\
Feel free to clone / fork and enjoy building❤️

## Table of contents

- [Tech Stack](#tech-stach)
- [Feature](#feature)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environtment Variable](#environtment-variable)
- [Database](#database)
- [Authentication](#authentication)

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
    |- auth/                  # Better-Auth configuration
    |- db/                  # Prisma configuration
    |- config/              # tsconfig, prettier, and eslint configs
    |- env/                 # env guard with zod
    |- utils/               # Sharing utility
|-  .env.example            # Example of .env
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
| pkg/auth   |                                                                            Better Auth Config |
| pkg/db     |                                                          Prisma Configuration + Prisma Schema |
| pkg/config |                                                    Shared config (tsconfig, prettier, eslint) |
| pkg/env    | Environtment variable guard that will stop if variable not comply with type that has been set |
| pkg/utils  |                                            Shared utility (separated client + Server) utility |

## Prerequisites

- Bun@1.4.4
- postgresql (local / hosted)

## Getting Started

### 1. Clone or Fork Repo

#### Clone

Clone repo on your computer.

```bash
git clone https://github.com/vyar20/slack-dm.git <your folder>
cd <your folder>
```

#### Fork

Fork repo on your computer.

```bash
gh repo fork https://github.com/vyar20/slack-dm.git
```

### 2. Configure .env

Copy .env.example to .env and fill up all the variables. Follow [Environtment Variable](#environtment-variable) for Guidelines.\
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

Environtment Variables validated on [`/pkg/env/src/env.ts`](pkg/env/src/env.ts). Make sure all variables already set on **envSchema** variables.\
Every environtment variables needs to set on [`/pkg/env/src/env.ts`](pkg/env/src/env.ts) if you add new variables.

| Variable                 | Type                                          |                                    Description |
| :----------------------- | --------------------------------------------- | ---------------------------------------------: |
| **NODE_ENV**             | enum one of `development \| production`       |                                   Runtime mode |
| **PORT**                 | number (coerced)                              |             Where app running on spesific port |
| **BETTER_AUTH_BASE_URL** | Base url should start with `(http\|https)://` |                           Better-Auth base url |
| **BETTER_AUTH_SECRET**   | String min 32 chars                           | Secret that used by Better-Auth for encryption |

## Database

You can find all database models on `pkg/db/prisma/models/*`.

### User Schema - [User Schema](/pkg/db/prisma/models/user.prisma)

```
model User {
    id            String    @id
    name          String
    email         String    @unique
    emailVerified Boolean
    image         String?
    createdAt     DateTime  @db.Timestamptz(3)
    updatedAt     DateTime  @db.Timestamptz(3)
    accounts      Account[]
    sessions      Session[]

    @@map("user")
}
```

### Account Schema - [Account Schema](/pkg/db/prisma/models/account.prisma)

```
model Account {
    id                    String    @id
    user                  User      @relation(fields: [userId], references: [id])
    userId                String
    accountId             String
    providerId            String
    accessToken           String?
    refreshToken          String?
    accessTokenExpiresAt  DateTime? @db.Timestamptz(3)
    refreshTokenExpiresAt DateTime? @db.Timestamptz(3)
    scope                 String?
    idToken               String?
    password              String?
    createdAt             DateTime  @db.Timestamptz(3)
    updatedAt             DateTime  @db.Timestamptz(3)

    @@index([userId], map: "account_userId_idx")
    @@map("account")
}
```

### Session Schema - [Session Schema](/pkg/db/prisma/models/session.prisma)

```
model Session {
    id        String   @id
    user      User     @relation(fields: [userId], references: [id])
    userId    String
    token     String   @unique
    expiresAt DateTime @db.Timestamptz(3)
    ipAddress String?
    userAgent String?
    createdAt DateTime @db.Timestamptz(3)
    updatedAt DateTime @db.Timestamptz(3)

    @@index([userId], map: "session_userId_idx")
    @@map("session")
}
```

### Verification Schema - [Verification Schema](/pkg/db/prisma/models/verification.prisma)

```
model Verification {
    id         String   @id
    identifier String
    value      String
    expiresAt  DateTime @db.Timestamptz(3)
    createdAt  DateTime @db.Timestamptz(3)
    updatedAt  DateTime @db.Timestamptz(3)

    @@index([identifier], map: "verification_identifier_idx")
    @@map("verification")
}
```

## Authentication

Authentication built with [Better-Auth](https://better-auth.com/). All authentication configuration on [`pkg/auth/src/server-auth.ts`](pkg/auth/src/server-auth.ts).\
You can learn how to get setup and get the clientId and client secret on [Better-Auth](https://better-auth.com/) website.\
All authentication schema is setup on.

- [`pkg/db/prisma/models/account.prisma`](pkg/db/prisma/models/account.prisma)
- [`pkg/db/prisma/models/session.prisma`](pkg/db/prisma/models/session.prisma)
- [`pkg/db/prisma/models/user.prisma`](pkg/db/prisma/models/user.prisma)
- [`pkg/db/prisma/models/verification.prisma`](pkg/db/prisma/models/verification.prisma)

Default authentication method is:

- Email & Password
- Google
- Github
- X (twitter)

### Notes for Email & Password

Email and password work flow requires user to activate their account. Activation link will send via Email (**production**) and on will appear on log (**development**).\
Email will send using [Nodemailer](https://nodemailer.com/) so please learn how to use this library.\
Default config for [Nodemailer](https://nodemailer.com/) using gmail smtp that will authenticated by App Password that you can get on your google or you can click this [link](https://myaccount.google.com/apppasswords).\
Before continue, make sure you already setup the [Environtment Variable](#environtment-variable)

### Social Provider

Using social provider for your authentication method requires you to get clientId and clientSecret (most sso requires that).\
So you need to learn how to get those id and secret and learn how to use it on [Better-Auth](https://better-auth.com/).

### Session Expires

Default session will lasting for 8 hours but you can extend it on [`pkg/auth/src/server-auth.ts`](pkg/auth/src/server-auth.ts) on **sessionDuration** variable.

```typescript
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { db } from '@repo/db'
import { env } from '@repo/env'
import { betterAuth } from 'better-auth'

// Max session 8 hours (seconds)
const sessionDuration = 1000 * 60 * 60 * 8 // You can override on by changing this line (#8 is the hours)

export const serverAuth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  baseURL: env.BETTER_AUTH_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: sessionDuration
  },
  advanced: {
    database: {
      joins: true
    }
  },
  /**
   * Authentication method
   * Read Better-Auth docs for more methods
   * https://better-auth.com
   */
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    // Add your SSO here
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET
    },
    twitter: {
      clientId: env.BETTER_AUTH_X_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_X_CLIENT_SECRET
    }
  }
})
```
