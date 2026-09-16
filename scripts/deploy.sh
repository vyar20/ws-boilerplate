#!/usr/bin/env bash
#
# Runs ON the VPS (invoked by the GitHub Actions deploy job after `git pull`).
# Installs dependencies, regenerates the Prisma client, builds the frontend,
# and restarts the running server.
#
# One-time VPS prerequisites:
#   - Bun installed              (curl -fsSL https://bun.sh/install | bash)
#   - Repo cloned + .env files   (apps/backend/.env, apps/frontend/.env)
#   - A process manager running the app (systemd unit or pm2) — see README
#
set -euo pipefail

# Non-interactive SSH shells often don't have ~/.bun/bin on PATH.
export PATH="$HOME/.bun/bin:$PATH"

echo "▶ Installing dependencies…"
bun install --frozen-lockfile

echo "▶ Generating Prisma client…"
bun run db:gen

# Sync the schema to the database on every deploy. Comment this out if you
# manage schema changes with migrations instead (safer for production data).
# bun run db:push

echo "▶ Building frontend…"
bun run build

echo "▶ Restarting service…"
# Pick the one that matches your setup:
sudo systemctl restart ws-app        # systemd (needs passwordless sudo for this)
# pm2 restart ws-app                  # pm2 (no sudo needed)

echo "✔ Deploy complete."
