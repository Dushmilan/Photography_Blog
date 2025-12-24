# Cloudflare Deployment Setup

This guide explains how to deploy the Photography Blog application to Cloudflare Pages (frontend) and Cloudflare Workers (backend).

## Prerequisites

1. Install Wrangler CLI: `npm install -g wrangler`
2. Log in to Cloudflare: `wrangler login`

## Environment Variables

### Frontend (Cloudflare Pages)

Add these environment variables in the Cloudflare Pages dashboard:

- `REACT_APP_API_URL` - The URL of your backend API (e.g., `https://your-worker.your-subdomain.workers.dev/api`)

### Backend (Cloudflare Workers)

Add these secrets in the Cloudflare Workers dashboard:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase project API key

## Frontend Deployment (Cloudflare Pages)

1. Connect your GitHub repository to Cloudflare Pages
2. Set the build configuration:
   - Build command: `npm run build`
   - Build directory: `frontend/build`
   - Root directory: `.`
3. Add environment variables as mentioned above
4. Deploy!

## Backend Deployment (Cloudflare Workers)

1. Navigate to the backend directory: `cd backend`
2. Update the `wrangler.toml` file with your account ID:
   ```toml
   [env.production]
   account_id = "your-actual-account-id"
   ```
3. Deploy using: `npx wrangler deploy`
4. Add your environment variables/secrets in the Cloudflare dashboard

## API Gateway Configuration

When your backend is deployed, you'll get a URL like `https://your-worker.your-subdomain.workers.dev`. 
Configure your frontend to use this as the API base URL.

## Troubleshooting

1. If you encounter CORS issues, make sure your frontend domain is added to the allowed origins in your Supabase project.
2. Check the worker logs using `npx wrangler tail` to debug any runtime issues.
3. Verify all environment variables are correctly set in both Cloudflare Pages and Workers dashboards.