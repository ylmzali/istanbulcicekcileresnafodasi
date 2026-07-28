#!/usr/bin/env bash
# Run Prisma migrations against production DATABASE_URL (Coolify Execute Command
# or any shell that has the app env). Never seeds production.
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required"
  exit 1
fi

echo "Running: prisma migrate deploy"
npx prisma migrate deploy

echo "OK — migrations applied."
echo "Smoke checks:"
echo "  1. Open NEXT_PUBLIC_APP_URL"
echo "  2. Admin login"
echo "  3. Members / dues list loads"
echo "Do NOT run npm run db:seed in production unless intentional."
