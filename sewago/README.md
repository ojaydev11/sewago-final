# SewaGo
## Deploy to Railway (Backend)

Set these variables in Railway:
- NODE_ENV=production
- PORT=4000
- MONGODB_URI=your Atlas SRV
- JWT_ACCESS_SECRET=64-char
- JWT_REFRESH_SECRET=64-char
- CLIENT_ORIGIN=https://<your-vercel-site>
- SEED_KEY=32+ char (optional)
- ALLOW_SEEDING=false

With `railway.toml` present, Railway will deploy from `backend/`.


## Run E2E locally (Windows)

Run from repo root (`sewago/`):

```powershell
pwsh -File .\scripts\win\start-e2e.ps1
```

This will:
- Ensure env files for backend and frontend
- Install dependencies if missing
- Start backend on 4100 and frontend on 3001 (fallback to 4101/3002 if busy)
- Seed sample data
- Run backend smoke tests and Playwright headless tests
- Store artifacts at `artifacts/e2e/`

## E2E Assumptions
- Local MongoDB at `mongodb://127.0.0.1:27017`; if absent, consider installing MongoDB. Future work: boot `mongodb-memory-server` automatically.
- Payments endpoints are stubs returning `{ ok: true, provider, payload }`.
- Socket.io namespace `/ws` with path `/ws/socket.io`.
- Env header protection for seed endpoints via `X-Seed-Key`.

## Scripts
See `package.json` at root for `e2e:prepare`, `e2e:start`, and `e2e`.


## Environment Setup

Create `.env` files for backend and frontend from `env.production.example` as a starting point.

### Backend (.env)
Required in production:

```
NODE_ENV=production
PORT=4000
MONGODB_URI=your-mongodb-uri
CLIENT_ORIGIN=https://your-frontend.vercel.app
JWT_ACCESS_SECRET=64+char
JWT_REFRESH_SECRET=64+char
# Optional: SMTP for booking emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
EMAIL_FROM=no-reply@sewago.app
```

### Frontend (.env)

```
NEXT_PUBLIC_API_URL=https://your-backend.example.com/api
DATABASE_URL=your-mongodb-uri
AUTH_SECRET=64+char
NEXT_PUBLIC_I18N_ENABLED=true
NEXT_PUBLIC_SEWAAI_ENABLED=false
NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED=false
```