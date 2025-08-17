# SewaGo Backend Deployment (Railway)

Deploy the backend as a Railway Node service.

## Requirements
- Build command: `npm ci && npm run build`
- Start command: `node dist/server.js`
- The app must bind to `process.env.PORT` (Railway sets this automatically).

## Environment Variables (set in Railway project)
- `MONGODB_URI` (required): MongoDB connection string
- `CLIENT_ORIGIN` (required): e.g., `https://sewago-final.vercel.app`
- `NODE_ENV`: `production`

## Health Check
- `GET /api/health` should return 200 JSON like:
```json
{ "ok": true, "service": "sewago-backend", "env": "production" }
```

## Steps
1. Open your Railway project for the backend service.
2. Ensure the Service is connected to this repo (root dir: `backend`).
3. Set build/start commands as above.
4. Add the env vars listed.
5. Deploy. Wait until healthy.
6. Copy the Public Domain (e.g., `https://sewago-backend.up.railway.app`).

## Verify
```bash
curl -sS https://<RAILWAY_BACKEND_URL>/api/health | jq .
```

If you need CORS to allow your frontend, ensure `CLIENT_ORIGIN` matches your Vercel frontend domain.