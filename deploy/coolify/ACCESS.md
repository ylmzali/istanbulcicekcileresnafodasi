# Coolify access

## Production (Hetzner VPS)
- Server: `2.28.16.170` (`ssh hetzner-iceo`)
- Coolify panel: http://2.28.16.170:8000
- Site (app): http://2.28.16.170:3000
- Health: http://2.28.16.170:3000/api/health
- Containers: `iceo-app`, `iceo-mysql`
- Env on server: `/root/iceo.production.env`
- Site admin password (after seed):
  `ssh hetzner-iceo "grep ^ADMIN_PASSWORD= /root/iceo.production.env"`
- OS: Ubuntu 26.04 · Coolify 4.1.2

## Local Coolify practice (Colima)
- URL: http://127.0.0.1:8000
- Admin email (local only): `admin@localhost.local`
- Instance runs inside Colima (Ubuntu 24.04 + Coolify 4.1.2)

## Practice MySQL (Coolify Docker network)
- Container: `iceo-mysql`
- Host port: `3307`
- DB: `istanbul_cicekciler_odasi`
- Connection values: `deploy/coolify/practice-database.env` (gitignored)
- Template: `deploy/coolify/practice-database.env.example`

## App deploy files (for real Coolify Git resource)
- Build pack: Dockerfile
- Port: 3000
- Env template: `.env.production.example`
- Steps: `deploy/coolify/05-app-setup.md`
- After deploy: `npx prisma migrate deploy` (or `bash deploy/coolify/06-migrate.sh`)

## Verified
- Hetzner: site `/` and `/api/health` → 200
- Migrations applied on production MySQL

## Domain (when ready)
1. A record → `2.28.16.170`
2. Update `NEXT_PUBLIC_APP_URL` / `AUTH_URL` in `/root/iceo.production.env`
3. Restart: `docker restart iceo-app`
4. Optionally put Coolify proxy + Let's Encrypt in front
