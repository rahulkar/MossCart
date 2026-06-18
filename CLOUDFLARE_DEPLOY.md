# Deploy MossCart to Cloudflare

Step-by-step guide for deploying the Cloudflare stack: **Worker** (Hono API), **D1** (SQLite database), and **Pages** (Vite React frontend).

> The original Express/Docker stack is not affected by this deployment.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Configure the Worker](#2-configure-the-worker)
3. [Create the D1 database](#3-create-the-d1-database)
4. [Install dependencies & generate Prisma](#4-install-dependencies--generate-prisma)
5. [Apply D1 migrations](#5-apply-d1-migrations)
6. [Seed the database](#6-seed-the-database)
7. [Set the JWT secret](#7-set-the-jwt-secret)
8. [Deploy the Worker](#8-deploy-the-worker)
9. [Lock down CORS](#9-lock-down-cors)
10. [Deploy the frontend to Pages](#10-deploy-the-frontend-to-pages)
11. [GitHub Actions](#11-github-actions)
12. [Verify the deployment](#12-verify-the-deployment)

---

## 1. Prerequisites

- A Cloudflare account (free tier works).
- Node.js **20** installed locally.
- Wrangler CLI authenticated:
  ```bash
  cd workers
  npx wrangler login
  ```
- Get your Cloudflare account ID:
  ```bash
  npx wrangler whoami
  ```

---

## 2. Configure the Worker

Replace the placeholders in `workers/wrangler.toml`:

```toml
account_id = "YOUR_ACCOUNT_ID"   # from `wrangler whoami`
```

Keep the D1 block as-is for now — you will fill `database_id` after creating the database.

---

## 3. Create the D1 database

```bash
cd workers
npx wrangler d1 create mosscart-db
```

Copy the `database_id` from the output and paste it into `workers/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mosscart-db"
database_id = "PASTE_DATABASE_ID_HERE"
migrations_dir = "prisma/migrations"
migrations_pattern = "prisma/migrations/*/migration.sql"
```

---

## 4. Install dependencies & generate Prisma

```bash
cd workers
npm ci
npx prisma generate
```

---

## 5. Apply D1 migrations

```bash
cd workers
npx wrangler d1 migrations apply mosscart-db
```

Or use the npm script:

```bash
npm run db:migrate:prod
```

---

## 6. Seed the database

Generate the seed SQL and execute it remotely:

```bash
cd workers
node prisma/seed.js > prisma/seed.sql
npx wrangler d1 execute mosscart-db --remote --file=prisma/seed.sql
```

Or use the npm script:

```bash
npm run db:seed:prod
```

---

## 7. Set the JWT secret

The Worker needs a secret key for signing tokens. It must be **at least 32 characters**.

```bash
cd workers
npx wrangler secret put JWT_SECRET
```

Or non-interactively:

```bash
printf "your-super-long-secret-min-32-chars" | npx wrangler secret put JWT_SECRET
```

> `workers/.dev.vars` is only used by `wrangler dev` locally. Production uses the secret you just set.

---

## 8. Deploy the Worker

```bash
cd workers
npx wrangler deploy
```

After deploy, note the Worker URL, for example:

```
https://mosscart-worker.<your-account>.workers.dev
```

Test it:

```bash
curl https://mosscart-worker.<your-account>.workers.dev/api/health
```

---

## 9. Lock down CORS

`workers/wrangler.toml` currently allows all origins:

```toml
[vars]
CORS_ORIGIN = "*"
```

For production, change it to your Pages URL:

```toml
[vars]
CORS_ORIGIN = "https://mosscart-pages.pages.dev"
```

Then redeploy:

```bash
npx wrangler deploy
```

---

## 10. Deploy the frontend to Pages

### Create the Pages project

Either via the Cloudflare dashboard (**Pages → Create a project**) or with Wrangler:

```bash
cd frontend
npx wrangler pages project create mosscart-pages
```

### Set the API base URL

Pages needs to know where the Worker API lives:

| Name | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://mosscart-worker.<your-account>.workers.dev/api` |

Add it as a repository variable for GitHub Actions, or as an environment variable in the Pages dashboard.

---

## 11. GitHub Actions

The repo already has `.github/workflows/deploy.yml`. Add these repository secrets:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token with `Cloudflare Workers:Edit` and `Cloudflare Pages:Edit` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

And this repository variable:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://mosscart-worker.<your-account>.workers.dev/api` |

Push to `main` or trigger the workflow manually. It will:

1. Deploy the Worker.
2. Apply D1 migrations.
3. Build and deploy the frontend to Pages.

---

## 12. Verify the deployment

1. Open the Pages URL.
2. Browse the product catalog.
3. Register a new user, log in, add to cart, and check out.
4. Watch Worker logs in real time:
   ```bash
   cd workers
   npx wrangler tail
   ```

---

## Quick reference

```bash
# Local development
cd workers
npm run dev

# Local database setup
npm run db:migrate
npm run db:seed

# Production deploy (manual)
npx wrangler deploy
npm run db:migrate:prod
npm run db:seed:prod
```
