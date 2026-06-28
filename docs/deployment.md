# Photography Blog — Deployment Guide

## Architecture

- **API**: Cloudflare Workers (Hono) + D1 (SQLite)
- **Image Storage**: ImageKit.io
- **Frontend**: Cloudflare Pages (static SPA)

## Prerequisites

- Node.js 18+
- Cloudflare account with **Workers Paid plan** (bcryptjs CPU time exceeds free tier)
- ImageKit.io account (API credentials)
- Wrangler CLI authenticated: `npx wrangler login`

## Environment Variables & Secrets

| Secret | Source | Description |
|---|---|---|
| `JWT_SECRET` | Generate (e.g. `openssl rand -hex 32`) | Access token signing |
| `JWT_REFRESH_SECRET` | Generate (different from above) | Refresh token signing |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit dashboard | API public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit dashboard | API private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit dashboard | e.g. `https://ik.imagekit.io/your_id` |

## Step-by-Step

### 1. Create D1 Database

```bash
cd worker
npx wrangler d1 create photography-blog-db
```

Copy the returned `database_id` and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "photography-blog-db"
database_id = "<paste-your-uuid-here>"
```

### 2. Apply Database Schema

```bash
npx wrangler d1 execute photography-blog-db --file=src/db/schema.sql
```

Verify tables were created:

```bash
npx wrangler d1 execute photography-blog-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### 3. Set Secrets

```bash
npx wrangler secret put JWT_SECRET
# paste your secret, press Enter

npx wrangler secret put JWT_REFRESH_SECRET
# paste your secret, press Enter

npx wrangler secret put IMAGEKIT_PUBLIC_KEY
# paste your public key, press Enter

npx wrangler secret put IMAGEKIT_PRIVATE_KEY
# paste your private key, press Enter

npx wrangler secret put IMAGEKIT_URL_ENDPOINT
# paste your url endpoint, press Enter
```

### 4. Deploy Worker

```bash
npx wrangler deploy
```

This outputs a URL like `https://photography-blog-api.<your-subdomain>.workers.dev`.

Test that it's live:

```bash
curl https://photography-blog-api.<your-subdomain>.workers.dev/api/ping
# {"message":"pong","status":"live","env":"production","timestamp":"..."}
```

### 5. Create Admin User

```bash
curl -X POST https://photography-blog-api.<your-subdomain>.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<strong-password>"}'
```

### 6. Update Frontend

Edit `frontend/src/config/apiConfig.js` and set the `production` URL:

```js
production: 'https://photography-blog-api.<your-subdomain>.workers.dev/api',
```

Deploy frontend to Cloudflare Pages (point to your frontend repo).

### 7. Verify Endpoints

```bash
# Login
curl -X POST https://photography-blog-api.<your-subdomain>.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}'

# Public gallery
curl https://photography-blog-api.<your-subdomain>.workers.dev/api/images/public

# Slideshow
curl https://photography-blog-api.<your-subdomain>.workers.dev/api/images/slideshow
```

## API Endpoints

### Public (no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/api/ping` | Health check |
| GET | `/api` | API info |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns tokens |
| GET | `/api/images/public` | Public gallery images |
| GET | `/api/images/gallery` | Alias for public |
| GET | `/api/images/slideshow` | Slideshow images |

### Authenticated (Bearer token)

| Method | Path | Description |
|---|---|---|
| GET | `/api/auth/me` | Current user |
| POST | `/api/tokens/refresh` | Refresh access token |
| POST | `/api/tokens/logout` | Invalidate tokens |
| GET | `/api/images/my-images` | User's images (DB) |
| GET | `/api/images/admin-gallery` | ImageKit + DB merged |
| POST | `/api/images` | Create image record |
| PUT | `/api/images/reorder` | Reorder gallery/slideshow |
| PUT | `/api/images/:id/public` | Toggle public status |
| PUT | `/api/images/:id/slideshow` | Toggle slideshow status |
| GET | `/api/images/:id` | Single image details |
| DELETE | `/api/images/:id` | Delete image |
| GET | `/api/imagekit/auth-parameters` | Upload auth params |
| GET | `/api/imagekit/images` | Paginated ImageKit files |
| GET | `/api/imagekit/image/:id` | Image with transform URLs |
| PUT | `/api/imagekit/image/:id` | Update public/slideshow |
| GET | `/api/imagekit/image/:id/transform` | Transform URL builder |

## Local Development

```bash
cd worker
npx wrangler dev
```

This starts a dev server at `http://localhost:8787`. The frontend's `development` URL is already set to `http://localhost:8787/api`.

For local D1, add to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "photography-blog-db"
database_id = "<your-database-id>"
```

Then `npx wrangler dev` will use the remote D1 database. To use a local D1, create a `.dev.vars` file with your secrets and use the `--local` flag.

## Troubleshooting

- **bcrypt timeout / 10ms CPU exceeded**: You must be on Workers Paid plan. The free tier limits CPU to 10ms per request; bcryptjs takes ~100-200ms.
- **D1 errors**: Verify the schema was applied and the `database_id` in `wrangler.toml` matches the created D1 database.
- **ImageKit uploads failing**: Ensure the `IMAGEKIT_PUBLIC_KEY` and `IMAGEKIT_PRIVATE_KEY` secrets are correctly set. Uploads happen client-side using ImageKit's client-side SDK; this API provides auth parameters.
- **CORS errors**: If frontend is on a different domain, add CORS headers to the Hono app via `hono/cors` middleware.
