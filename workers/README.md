# MossCart Cloudflare Worker

A Cloudflare Workers + D1 + Hono port of the MossCart API. This keeps the same REST contract as the Express backend so the existing React SPA can talk to it with only a `VITE_API_BASE_URL` change.

## Stack
- **Runtime:** Cloudflare Workers (V8 isolate / `fetch` handler)
- **Framework:** [Hono](https://hono.dev)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite-compatible serverless DB)
- **ORM:** Prisma with the D1 driver adapter
- **Auth:** Web Crypto (`jose` for JWT, PBKDF2 for passwords) — no Node-only `bcryptjs`/`jsonwebtoken`

## Project files

| File | Purpose |
|------|---------|
| `src/index.ts` | Hono app with all `/api/*` routes |
| `src/auth.ts` | JWT sign/verify and PBKDF2 password hashing |
| `src/db.ts` | Prisma client factory using the D1 binding |
| `src/validators/*.ts` | Zod schemas ported from the Express backend |
| `prisma/schema.prisma` | Same data model as the Express backend (provider = `sqlite`) |
| `prisma/migrations/` | Prisma-generated D1 migration SQL |
| `prisma/seed.sql` | Seed product catalog |
| `wrangler.toml` | Worker/D1 binding config (replace `account_id` and `database_id` before deploying) |
| `.dev.vars` | Local secrets (`JWT_SECRET`) |

## Local development

```bash
cd workers
npm install

# 1. Generate the Prisma client for the D1 adapter
npx prisma generate

# 2. Create / apply the D1 schema locally
npx wrangler d1 migrations apply mosscart-db --local

# 3. Seed the catalog
npm run db:seed

# 4. Run the worker locally
npx wrangler dev --port 8787
```

The API is available at `http://127.0.0.1:8787/api/...`.

## First production deploy

1. **Authenticate Wrangler** (one-time):
   ```bash
   npx wrangler login
   npx wrangler whoami   # note your account id
   ```

2. **Create the remote D1 database**:
   ```bash
   npx wrangler d1 create mosscart-db
   ```
   Copy the returned `database_id` into `wrangler.toml` and replace `YOUR_ACCOUNT_ID` with your account id.

3. **Set the JWT secret** (must be ≥ 32 characters):
   ```bash
   npx wrangler secret put JWT_SECRET
   ```

4. **Apply the schema and seed data remotely**:
   ```bash
   npx wrangler d1 migrations apply mosscart-db
   npx wrangler d1 execute mosscart-db --remote --file=prisma/seed.sql
   ```

5. **Deploy the Worker**:
   ```bash
   npx wrangler deploy
   ```

6. **Note the Worker URL** (e.g., `https://mosscart-worker.<your-subdomain>.workers.dev`) and set it as `VITE_API_BASE_URL` when building the frontend.

## CI/CD

The root `.github/workflows/deploy.yml` deploys both the Worker and the frontend (Cloudflare Pages) on pushes to `main`. Required repository secrets/vars:

- `CLOUDFLARE_API_TOKEN` — API token with **Cloudflare Workers** and **Cloudflare Pages** edit permissions.
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account id.
- `VITE_API_BASE_URL` (repository variable) — the deployed Worker URL.

## Production-readiness notes

- D1 is still maturing; review [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) before relying on it for high traffic.
- The JWT secret must be strong and rotated from the dev placeholder in `.dev.vars`.
- For real product images, move uploads to **Cloudflare R2** and store public R2 URLs in the `imageUrl` column.
- Add request logging, error tracking (e.g., Sentry), and rate limiting (Cloudflare WAF / Workers KV counters) before public launch.
