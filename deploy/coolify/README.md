# Coolify self-hosted runbook

Scripts live in `deploy/coolify/`. Run them **on the Ubuntu VPS** (not on your Mac), in order.

## Order

1. Provision VPS: Ubuntu 22.04/24.04, ≥4 GB RAM recommended, SSH as root.
2. Copy this repo (or at least `deploy/coolify/`) to the server.
3. `sudo bash deploy/coolify/01-firewall.sh`
4. `sudo bash deploy/coolify/02-install-coolify.sh`
5. Open `http://VPS_IP:8000` and create the admin account immediately.
6. `bash deploy/coolify/03-print-dns.sh VPS_IP YOURDOMAIN` → set A records.
7. `bash deploy/coolify/04-mysql-checklist.sh` → create MySQL in Coolify UI.
8. Follow `deploy/coolify/05-app-setup.md` → Git app, env, volumes, SSL, deploy.
9. In Coolify Execute Command (app container): `bash deploy/coolify/06-migrate.sh`  
   or `npx prisma migrate deploy`

## Repo deploy files

| File | Role |
| --- | --- |
| `Dockerfile` | Production Next.js standalone image |
| `.dockerignore` | Lean build context |
| `nixpacks.toml` | Fallback if Dockerfile is not selected |
| `.env.production.example` | Coolify env keys |
| `next.config.ts` `output: "standalone"` | Required for Docker runner |

## Local Colima practice stack

For a local dry-run without a public VPS, use:

```bash
docker compose -f deploy/coolify/docker-compose.practice.yml up -d --build
```

This is **not** Coolify itself; it mirrors MySQL + app + migrate for smoke testing.
