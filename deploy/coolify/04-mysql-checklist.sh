#!/usr/bin/env bash
# Checklist: create MySQL in Coolify and capture DATABASE_URL.
# This script does not call the Coolify API; it prints exact panel steps.
set -euo pipefail

DOMAIN="${1:-YOURDOMAIN}"

cat <<EOF
Coolify → Project → + New → Database → MySQL 8

Suggested settings:
  Name:          iceo-mysql
  Database:      istanbul_cicekciler_odasi
  User:          iceo
  Password:      (generate strong; store in password manager)
  Public Port:   OFF (keep private on Docker network)

After deploy, open the MySQL resource → Connect / URLs and copy the
internal URL, e.g.:

  mysql://iceo:PASSWORD@iceo-mysql:3306/istanbul_cicekciler_odasi

Save it as DATABASE_URL for the app (todo git-app).

Also note Coolify internal hostname (often the resource name).
Do NOT reuse local .env credentials in production.

Verify from Coolify Terminal on the MySQL container (optional):
  mysql -u iceo -p istanbul_cicekciler_odasi -e 'SELECT 1'

Next: follow deploy/coolify/05-app-setup.md
EOF
