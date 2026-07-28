# Coolify app resource setup (Git → Dockerfile)

## 1. Source
- Coolify → Project → + New → Application → Public/Private Git Repository
- Repo: `https://github.com/ylmzali/istanbulcicekcileresnafodasi.git`
- Branch: `main`
- Build Pack: **Dockerfile** (repo root `Dockerfile`)
- Port: `3000`

## 2. Domains
- Domains: `YOURDOMAIN` and optionally `www.YOURDOMAIN`
- Enable HTTPS / Let's Encrypt
- Force HTTPS: on

## 3. Environment variables
Copy from `.env.production.example` and fill secrets:

| Key | Notes |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `HOSTNAME` | `0.0.0.0` |
| `DATABASE_URL` | Internal MySQL URL from Coolify DB resource |
| `AUTH_SECRET` | `openssl rand -hex 32` |
| `AUTH_URL` | `https://YOURDOMAIN` |
| `NEXT_PUBLIC_APP_URL` | `https://YOURDOMAIN` |
| `NEXT_PUBLIC_SITE_NAME` | İstanbul Çiçekçiler Esnaf Odası |
| `ADMIN_USERNAME` | Initial admin (seed / bootstrap only) |
| `ADMIN_PASSWORD` | Strong password |
| `ADMIN_EMAIL` | Real mailbox |
| `PAYMENT_PROVIDER` | `mock` until iyzico live |
| `FIELD_ENCRYPTION_KEY` | Optional; falls back to `AUTH_SECRET` |

Do not commit real values. Set them only in Coolify UI.

## 4. Persistent storage (volumes)
Map host/Coolify volumes to:

| Container path | Purpose |
| --- | --- |
| `/app/public/uploads` | Public media |
| `/app/storage/resources` | Resource files |
| `/app/storage/applications` | Application documents |
| `/app/storage/receipts` | Receipt files |

Without volumes, uploads disappear on redeploy.

## 5. Pre/Post deploy
- Build command: handled by Dockerfile (`npm run build` includes `prisma generate`)
- Post-deploy / one-shot: `npx prisma migrate deploy`
  - Coolify → Execute Command, or add a release command if available
- Do **not** run `db:seed` automatically in production

## 6. Deploy
- Click Deploy
- Watch Build logs, then Runtime logs
- Smoke test: home, `/yonetim` login, one DB-backed list page

## 7. Network
- App and MySQL must be on the same Coolify/Docker network
- Prefer internal `DATABASE_URL` host (resource name), not public IP
