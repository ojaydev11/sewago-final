# SewaGo Backend Deployment (Render)

This document describes how to deploy the backend to Render as a Node Web Service.

## Requirements
- Node Web Service
- Build command: `npm ci && npm run build`
- Start command: `node dist/server.js`

## Environment Variables (set in Render dashboard)
- `MONGODB_URI` (required): connection string to your MongoDB database
- `CLIENT_ORIGIN`: the frontend origin (e.g., `https://sewago-final.vercel.app`)
- `NODE_ENV`: `production`

Optional:
- Any other feature flags used by the app, if needed

## Steps
1. In Render, click "New" → "Web Service".
2. Connect this GitHub repo (`ojaydev11/sewago-final`).
3. If prompted, set Root Directory to `backend`.
4. Set Build Command to `npm ci && npm run build`.
5. Set Start Command to `node dist/server.js`.
6. Add env vars:
   - `MONGODB_URI` = <provide value>
   - `CLIENT_ORIGIN` = `https://sewago-final.vercel.app`
   - `NODE_ENV` = `production`
7. Click "Create Web Service". Wait until the service is healthy.

## Verify
After deploy, copy your Render URL (e.g. `https://sewago-backend.onrender.com`).

Run:
```bash
curl -sS https://<YOUR_BACKEND_URL>/api/health | jq .
```
Expected:
```json
{ "ok": true, "service": "sewago-backend", "env": "production" }
```

## Notes
- The server listens on `process.env.PORT` (assigned by Render) or `8001` locally.
- If you need to change logging or limits, do so without exposing PII.